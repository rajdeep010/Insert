import type {
	CollaborationInviteV2,
	CollaborationRoleV2,
	CollaborationStateV2,
	CollaborationTopicCollaboratorV2,
	CollaborationTopicOptionV2,
	CollaborationMembershipV2,
} from "@/types/collaboration-v2";

type CollaborationActionV2 =
	| { type: "RESET" }
	| {
		type: "HYDRATE";
		payload: {
			myCollaborations: CollaborationMembershipV2[];
			pendingInvites: CollaborationInviteV2[];
			sentInvites: CollaborationInviteV2[];
			topicOptions: CollaborationTopicOptionV2[];
		};
	}
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_TOPIC_LOADING"; payload: boolean }
	| { type: "SET_ERROR"; payload: string | null }
	| { type: "SET_SELECTED_TOPIC"; payload: string | null }
	| { type: "SET_TOPIC_CONTEXT"; payload: { collaborators: CollaborationTopicCollaboratorV2[]; role: CollaborationRoleV2 | null } }
	| { type: "ADD_SENT_INVITE"; payload: CollaborationInviteV2 }
	| { type: "UPDATE_PENDING_STATUS"; payload: { requestId: string; status: CollaborationInviteV2["status"] } }
	| { type: "UPDATE_SENT_STATUS"; payload: { requestId: string; status: CollaborationInviteV2["status"] } }
	| { type: "REMOVE_SENT_INVITE"; payload: string }
	| { type: "UPSERT_COLLABORATOR"; payload: CollaborationTopicCollaboratorV2 }
	| { type: "UPDATE_COLLABORATOR_ROLE"; payload: { id: string; role: Exclude<CollaborationRoleV2, "OWNER"> } }
	| { type: "REMOVE_COLLABORATOR"; payload: string };

export const initialCollaborationStateV2: CollaborationStateV2 = {
	myCollaborations: [],
	pendingInvites: [],
	sentInvites: [],
	topicOptions: [],
	selectedTopicId: null,
	topicCollaborators: [],
	currentTopicRole: null,
	isInitialLoading: false,
	isTopicLoading: false,
	error: null,
};

export default function CollaborationReducerV2(
	state: CollaborationStateV2,
	action: CollaborationActionV2
): CollaborationStateV2 {
	switch (action.type) {
		case "RESET":
			return initialCollaborationStateV2;
		case "SET_LOADING":
			return { ...state, isInitialLoading: action.payload };
		case "SET_TOPIC_LOADING":
			return { ...state, isTopicLoading: action.payload };
		case "SET_ERROR":
			return { ...state, error: action.payload };
		case "HYDRATE":
			return {
				...state,
				...action.payload,
				selectedTopicId: state.selectedTopicId ?? action.payload.topicOptions[0]?.id ?? null,
				error: null,
			};
		case "SET_SELECTED_TOPIC":
			return { ...state, selectedTopicId: action.payload };
		case "SET_TOPIC_CONTEXT":
			return {
				...state,
				topicCollaborators: action.payload.collaborators,
				currentTopicRole: action.payload.role,
			};
		case "ADD_SENT_INVITE":
			return { ...state, sentInvites: [action.payload, ...state.sentInvites] };
		case "UPDATE_PENDING_STATUS":
			return {
				...state,
				pendingInvites: state.pendingInvites.map((invite) =>
					invite.requestId === action.payload.requestId ? { ...invite, status: action.payload.status } : invite
				),
			};
		case "UPDATE_SENT_STATUS":
			return {
				...state,
				sentInvites: state.sentInvites.map((invite) =>
					invite.requestId === action.payload.requestId ? { ...invite, status: action.payload.status } : invite
				),
			};
		case "REMOVE_SENT_INVITE":
			return {
				...state,
				sentInvites: state.sentInvites.filter((invite) => invite.requestId !== action.payload),
			};
		case "UPSERT_COLLABORATOR": {
			const exists = state.topicCollaborators.some((collaborator) => collaborator.id === action.payload.id);
			return {
				...state,
				topicCollaborators: exists
					? state.topicCollaborators.map((collaborator) =>
						collaborator.id === action.payload.id ? action.payload : collaborator
					)
					: [...state.topicCollaborators, action.payload],
			};
		}
		case "UPDATE_COLLABORATOR_ROLE":
			return {
				...state,
				topicCollaborators: state.topicCollaborators.map((collaborator) =>
					collaborator.id === action.payload.id ? { ...collaborator, role: action.payload.role } : collaborator
				),
			};
		case "REMOVE_COLLABORATOR":
			return {
				...state,
				topicCollaborators: state.topicCollaborators.filter((collaborator) => collaborator.id !== action.payload),
			};
		default:
			return state;
	}
}