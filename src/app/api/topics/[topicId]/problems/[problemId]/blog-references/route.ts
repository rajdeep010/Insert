import { Types } from "mongoose";

import { getAuthenticatedUsername } from "@/lib/api/auth";
import dbConnect from "@/lib/dbConnect";
import BlogCollectionModel from "@/model/BlogCollection";
import BlogModel from "@/model/Blog";
import ProblemModel from "@/model/Problem";
import TopicModel from "@/model/Topic";
import {
	attachBlogReferenceSchema,
	collectionIdParamsSchema,
} from "@/schemas/blogCollectionSchema";
import {
	problemIdParamSchema,
	topicIdParamSchema,
} from "@/schemas/topicSchema";

type RouteContext = {
	params: {
		topicId: string;
		problemId: string;
	};
};

export async function POST(request: Request, context: RouteContext) {
	const currentUsername = await getAuthenticatedUsername(request);

	if (!currentUsername) {
		return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
	}

	const parsedTopicParams = topicIdParamSchema.safeParse({ topicId: context.params.topicId });
	const parsedProblemParams = problemIdParamSchema.safeParse({ problemId: context.params.problemId });

	if (!parsedTopicParams.success || !parsedProblemParams.success) {
		return Response.json({ success: false, message: "Invalid topic or problem id" }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
	}

	const parsedBody = attachBlogReferenceSchema.safeParse(body);
	if (!parsedBody.success) {
		return Response.json({ success: false, message: parsedBody.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
	}

	await dbConnect();

	try {
		const topic = await TopicModel.findOne({ id: parsedTopicParams.data.topicId }).select("_id creator_username collaborators");

		if (!topic) {
			return Response.json({ success: false, message: "Topic not found" }, { status: 404 });
		}

		const isAllowed =
			topic.creator_username === currentUsername ||
			topic.collaborators?.some((collaborator: { username: string }) => collaborator.username === currentUsername);

		if (!isAllowed) {
			return Response.json({ success: false, message: "You are not allowed to update this problem" }, { status: 403 });
		}

		const blog = await BlogModel.findOne({
			_id: parsedBody.data.blogId,
			creator: currentUsername,
			status: "active",
		}).select("_id");

		if (!blog) {
			return Response.json({ success: false, message: "Blog not found" }, { status: 404 });
		}

		if (parsedBody.data.collectionId) {
			const collection = await BlogCollectionModel.findOne({
				_id: parsedBody.data.collectionId,
				ownerUsername: currentUsername,
			}).select("_id blogIds");

			if (!collection) {
				return Response.json({ success: false, message: "Collection not found" }, { status: 404 });
			}

			const blogExistsInCollection = collection.blogIds.some((blogId) => blogId.toString() === parsedBody.data.blogId);
			if (!blogExistsInCollection) {
				return Response.json({ success: false, message: "Blog is not part of the selected collection" }, { status: 400 });
			}
		}

		const problem = await ProblemModel.findOne({
			_id: parsedProblemParams.data.problemId,
			topicId: topic._id,
		});

		if (!problem) {
			return Response.json({ success: false, message: "Problem not found" }, { status: 404 });
		}

		const isDuplicateReference = problem.blogReferences?.some((reference) => {
			const sameBlog = reference.blogId?.toString() === parsedBody.data.blogId;
			const sameCollection = (reference.collectionId?.toString() || null) === (parsedBody.data.collectionId || null);
			const sameKind = reference.kind === parsedBody.data.kind;
			return sameBlog && sameCollection && sameKind;
		});

		if (isDuplicateReference) {
			return Response.json({ success: false, message: "This blog reference already exists for the problem" }, { status: 409 });
		}

		problem.blogReferences.push({
			blogId: new Types.ObjectId(parsedBody.data.blogId),
			collectionId: parsedBody.data.collectionId ? new Types.ObjectId(parsedBody.data.collectionId) : null,
			kind: parsedBody.data.kind,
			label: parsedBody.data.label,
			addedBy: currentUsername,
			addedAt: new Date(),
		} as never);

		await problem.save();

		const createdReference = problem.blogReferences[problem.blogReferences.length - 1];

		return Response.json({ success: true, message: "Blog reference attached successfully", reference: createdReference, problem }, { status: 201 });
	} catch {
		return Response.json({ success: false, message: "Error attaching blog reference" }, { status: 500 });
	}
}