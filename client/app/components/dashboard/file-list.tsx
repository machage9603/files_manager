"use client"

import { useState } from "react"
import type { FileType } from "@/types/file"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Download,
  Eye,
  FileText,
  Folder,
  MoreHorizontal,
  Trash,
  Lock,
  Unlock,
  FileCode,
  FileImage,
  FileAudio,
  FileVideo,
  File,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface FileListProps {
  files: FileType[]
  onFolderClick: (folderId: string) => void
  onRefresh: () => void
}

export function FileList({ files, onFolderClick, onRefresh }: FileListProps) {
  const { toast } = useToast()
  const [fileToDelete, setFileToDelete] = useState<FileType | null>(null)

  const getFileIcon = (file: FileType) => {
    if (file.type === "folder") return <Folder className="h-4 w-4 text-primary" />

    const mimeType = file.mimeType || ""

    if (mimeType.startsWith("image/")) return <FileImage className="h-4 w-4 text-blue-500" />
    if (mimeType.startsWith("text/")) return <FileText className="h-4 w-4 text-yellow-500" />
    if (mimeType.startsWith("audio/")) return <FileAudio className="h-4 w-4 text-green-500" />
    if (mimeType.startsWith("video/")) return <FileVideo className="h-4 w-4 text-red-500" />
    if (mimeType.includes("application/json") || mimeType.includes("application/javascript")) {
      return <FileCode className="h-4 w-4 text-purple-500" />
    }

    return <File className="h-4 w-4 text-gray-500" />
  }

  const formatFileSize = (size: number) => {
    if (!size) return "—"

    const units = ["B", "KB", "MB", "GB", "TB"]
    let unitIndex = 0
    let fileSize = size

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024
      unitIndex++
    }

    return `${fileSize.toFixed(1)} ${units[unitIndex]}`
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  const handleFileClick = (file: FileType) => {
    if (file.type === "folder") {
      onFolderClick(file.id)
      return
    }

    // For files, open preview or download
    window.open(`/api/files/${file.id}/data`, "_blank")
  }

  const handleDeleteFile = async () => {
    if (!fileToDelete) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/files/${fileToDelete.id}`, {
        method: "DELETE",
        headers: {
          "X-Token": token || "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete file")
      }

      toast({
        title: "Success",
        description: "File deleted successfully",
      })

      onRefresh()
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFileToDelete(null)
    }
  }

  const toggleFilePublish = async (file: FileType) => {
    try {
      const token = localStorage.getItem("token")
      const endpoint = file.isPublic ? `/api/files/${file.id}/unpublish` : `/api/files/${file.id}/publish`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "X-Token": token || "",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to ${file.isPublic ? "unpublish" : "publish"} file`)
      }

      toast({
        title: "Success",
        description: `File ${file.isPublic ? "unpublished" : "published"} successfully`,
      })

      onRefresh()
    } catch (error) {
      console.error("Error toggling file publish:", error)
      toast({
        title: "Error",
        description: `Failed to ${file.isPublic ? "unpublish" : "publish"} file. Please try again.`,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead className="hidden md:table-cell">Modified</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <div className="flex cursor-pointer items-center gap-2" onClick={() => handleFileClick(file)}>
                    {getFileIcon(file)}
                    <span className="truncate">{file.name}</span>
                    {file.isPublic && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Public</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {file.type === "folder" ? "—" : formatFileSize(file.size || 0)}
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(file.updatedAt || file.createdAt)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {file.type === "folder" ? "Folder" : file.mimeType || "Unknown"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {file.type !== "folder" && (
                        <>
                          <DropdownMenuItem onClick={() => window.open(`/api/files/${file.id}/data`, "_blank")}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const a = document.createElement("a")
                              a.href = `/api/files/${file.id}/data?dl=1`
                              a.download = file.name
                              a.click()
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFilePublish(file)}>
                            {file.isPublic ? (
                              <>
                                <Lock className="mr-2 h-4 w-4" />
                                Make Private
                              </>
                            ) : (
                              <>
                                <Unlock className="mr-2 h-4 w-4" />
                                Make Public
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setFileToDelete(file)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {fileToDelete?.name}.
              {fileToDelete?.type === "folder" && " This will also delete all files and folders inside."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
