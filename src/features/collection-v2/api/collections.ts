import type {
    CollectionDetailResponse,
    CollectionEntry,
    CollectionListResponse,
    CollectionType,
    CollectionVisibility,
} from "@/types/collection";

type ApiError = { message?: string };

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const payload = await response.json() as T & ApiError;
    if (!response.ok) throw new Error(payload.message || "Collection request failed");
    return payload;
}

export const fetchMyCollections = () =>
    requestJson<CollectionListResponse>("/api/v2/collections?limit=50");

export const fetchPublicCollections = (ownerUsername?: string) =>
    requestJson<CollectionListResponse>(`/api/v2/collections/public?limit=50${ownerUsername ? `&owner=${encodeURIComponent(ownerUsername)}` : ""}`);

export const fetchCollection = (collectionId: string) =>
    requestJson<CollectionDetailResponse>(`/api/v2/collections/${collectionId}`);

export const fetchPublicCollection = (collectionId: string) =>
    requestJson<CollectionDetailResponse>(`/api/v2/collections/public/${collectionId}`);

export const createCollection = (input: {
    name: string;
    description: string;
    collectionType: CollectionType;
    visibility: CollectionVisibility;
}) => requestJson<{ success: true; collection: CollectionEntry }>("/api/v2/collections", {
    method: "POST",
    body: JSON.stringify(input),
});

export const updateCollectionMetadata = (
    collectionId: string,
    input: { name: string; description: string; visibility: CollectionVisibility },
) => requestJson<{ success: true; collection: CollectionEntry }>(`/api/v2/collections/${collectionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
});

export const deleteCollection = (collectionId: string) =>
    requestJson<{ success: true }>(`/api/v2/collections/${collectionId}`, { method: "DELETE" });

export const addCollectionItems = (collectionId: string, itemIds: string[]) =>
    requestJson<{ success: true; collection: CollectionEntry }>(`/api/v2/collections/${collectionId}/items`, {
        method: "POST",
        body: JSON.stringify({ itemIds }),
    });

export const removeCollectionItems = (collectionId: string, itemIds: string[]) =>
    requestJson<{ success: true; collection: CollectionEntry }>(`/api/v2/collections/${collectionId}/items`, {
        method: "DELETE",
        body: JSON.stringify({ itemIds }),
    });
