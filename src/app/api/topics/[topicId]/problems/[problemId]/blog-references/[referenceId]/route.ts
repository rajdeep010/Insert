import { Types } from "mongoose";

import { getAuthenticatedAccessToken, getAuthenticatedUsername } from "@/lib/api/auth";
import { resolveEntityPermissions } from "@/lib/collaboration/permissions";
import dbConnect from "@/lib/dbConnect";
import BlogCollectionModel from "@/model/BlogCollection";
import BlogModel from "@/model/Blog";
import ProblemModel from "@/model/Problem";
import TopicModel from "@/model/Topic";
import {
	referenceIdParamSchema,
	updateBlogReferenceSchema,
} from "@/schemas/blogCollectionSchema";
import {
	problemIdParamSchema,
	topicIdParamSchema,
} from "@/schemas/topicSchema";

type RouteContext = {
	params: {
		topicId: string;
		problemId: string;
		referenceId: string;
	};
};

export async function PATCH(request: Request, context: RouteContext) {
	const currentUsername = await getAuthenticatedUsername(request);

	if (!currentUsername) {
		return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
	}

	const parsedParams = parseRouteParams(context.params);
	if (!parsedParams.success) {
		return Response.json({ success: false, message: parsedParams.message }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
	}

	const parsedBody = updateBlogReferenceSchema.safeParse(body);
	if (!parsedBody.success) {
		return Response.json({ success: false, message: parsedBody.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
	}

	await dbConnect();

	try {
		const result = await getAuthorizedProblem({
			topicId: parsedParams.topicId,
			problemId: parsedParams.problemId,
			currentUsername,
			request,
		});

		if (!result.success) {
			return Response.json({ success: false, message: result.message }, { status: result.status });
		}

		const reference = result.problem.blogReferences.id(parsedParams.referenceId);
		if (!reference) {
			return Response.json({ success: false, message: "Reference not found" }, { status: 404 });
		}

		if (parsedBody.data.blogId) {
			const blog = await BlogModel.findOne({ _id: parsedBody.data.blogId, creator: currentUsername, status: "active" }).select("_id");
			if (!blog) {
				return Response.json({ success: false, message: "Blog not found" }, { status: 404 });
			}
			reference.blogId = new Types.ObjectId(parsedBody.data.blogId) as never;
		}

		if (Object.prototype.hasOwnProperty.call(parsedBody.data, "collectionId")) {
			if (parsedBody.data.collectionId) {
				const collection = await BlogCollectionModel.findOne({ _id: parsedBody.data.collectionId, ownerUsername: currentUsername }).select("_id blogIds");
				if (!collection) {
					return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
				}

				const currentBlogId = (parsedBody.data.blogId || reference.blogId.toString());
				const containsBlog = collection.blogIds.some((blogId) => blogId.toString() === currentBlogId);
				if (!containsBlog) {
					return Response.json({ success: false, message: "Blog is not part of the selected collection" }, { status: 400 });
				}
				reference.collectionId = new Types.ObjectId(parsedBody.data.collectionId) as never;
			} else {
				reference.collectionId = null as never;
			}
		}

		if (parsedBody.data.kind) {
			reference.kind = parsedBody.data.kind;
		}

		if (Object.prototype.hasOwnProperty.call(parsedBody.data, "label")) {
			reference.label = parsedBody.data.label || "";
		}

		await result.problem.save();

		return Response.json({ success: true, message: "Reference updated successfully", reference, problem: result.problem }, { status: 200 });
	} catch {
		return Response.json({ success: false, message: "Error updating blog reference" }, { status: 500 });
	}
}

export async function DELETE(request: Request, context: RouteContext) {
	const currentUsername = await getAuthenticatedUsername(request);

	if (!currentUsername) {
		return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
	}

	const parsedParams = parseRouteParams(context.params);
	if (!parsedParams.success) {
		return Response.json({ success: false, message: parsedParams.message }, { status: 400 });
	}

	await dbConnect();

	try {
		const result = await getAuthorizedProblem({
			topicId: parsedParams.topicId,
			problemId: parsedParams.problemId,
			currentUsername,
			request,
		});

		if (!result.success) {
			return Response.json({ success: false, message: result.message }, { status: result.status });
		}

		const reference = result.problem.blogReferences.id(parsedParams.referenceId);
		if (!reference) {
			return Response.json({ success: false, message: "Reference not found" }, { status: 404 });
		}

		reference.deleteOne();
		await result.problem.save();

		return Response.json({ success: true, message: "Reference deleted successfully", problem: result.problem }, { status: 200 });
	} catch {
		return Response.json({ success: false, message: "Error deleting blog reference" }, { status: 500 });
	}
}

function parseRouteParams(params: RouteContext["params"]) {
	const parsedTopic = topicIdParamSchema.safeParse({ topicId: params.topicId });
	const parsedProblem = problemIdParamSchema.safeParse({ problemId: params.problemId });
	const parsedReference = referenceIdParamSchema.safeParse({ referenceId: params.referenceId });

	if (!parsedTopic.success || !parsedProblem.success || !parsedReference.success) {
		return { success: false as const, message: "Invalid topic, problem, or reference id" };
	}

	return {
		success: true as const,
		topicId: parsedTopic.data.topicId,
		problemId: parsedProblem.data.problemId,
		referenceId: parsedReference.data.referenceId,
	};
}

async function getAuthorizedProblem({
	topicId,
	problemId,
	currentUsername,
	request,
}: {
	topicId: string;
	problemId: string;
	currentUsername: string;
	request: Request;
}) {
	const topic = await TopicModel.findOne({ id: topicId }).select("_id creator_username visibility");

	if (!topic) {
		return { success: false as const, status: 404, message: "Topic not found" };
	}

	const accessToken = await getAuthenticatedAccessToken(request);
	const permissions = await resolveEntityPermissions({
		entityType: "TOPIC",
		entityId: topicId,
		visibility: topic.visibility,
		ownerUsername: topic.creator_username,
		currentUsername,
		accessToken,
	});

	if (!permissions.canEdit) {
		return { success: false as const, status: 403, message: "You are not allowed to update this problem" };
	}

	const problem = await ProblemModel.findOne({ _id: problemId, topicId: topic._id });

	if (!problem) {
		return { success: false as const, status: 404, message: "Problem not found" };
	}

	return { success: true as const, problem };
}