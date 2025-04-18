export interface FileType {
    id: string
    userId: string
    name: string
    type: "folder" | "file"
    isPublic: boolean
    parentId?: string | null
    mimeType?: string
    size?: number
    localPath?: string
    createdAt: string
    updatedAt?: string
}
