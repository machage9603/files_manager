"use client"

import { useState } from "react"
import Image from "next/image"
import type { FileType } from "@/types/file"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  MoreVertical,
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

interface FileGridProps {
  files: FileType[]
  onFolderClick: (folderId: string) => void
  onRefresh: () => void
}

export function FileGrid({ files, onFolderClick, onRefresh }: FileGridProps) {
  const { toast } = useToast()
  const [fileToDelete, setFileToDelete] = useState<FileType | null>(null)

  const getFileIcon = (file: FileType) => {
    if (file.type === "folder") return <Folder className="h-12 w-12 text-primary" />

    const mimeType = file.mimeType || ""

    if (mimeType.startsWith("image/")) return <FileImage className="h-12 w-12 text-blue-500" />
    if (mimeType.startsWith("text/")) return <FileText className="h-12 w-12 text-yellow-500" />
    if (mimeType.startsWith("audio/")) return <FileAudio className="h-12 w-12 text-green-500" />
    if (mimeType.startsWith("video/")) return <FileVideo className="h-12 w-12 text-red-500" />
    if (mimeType.includes("application/json") || mimeType.includes("application/javascript")) {
      return <FileCode className="h-12 w-12 text-purple-500" />
    }

    return <File className="h-12 w-12 text-gray-500" />
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {files.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="flex h-40 cursor-pointer items-center justify-center p-4"
                onClick={() => handleFileClick(file)}
              >
                {file.type === "folder" ? (
                  getFileIcon(file)
                ) : file.mimeType?.startsWith("image/") ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={`/api/files/${file.id}/data${file.isPublic ? "" : "?size=500"}`}
                      alt={file.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  getFileIcon(file)
                )}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-2">
              <div className="truncate text-sm font-medium" title={file.name}>
                {file.name}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
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
            </CardFooter>
          </Card>
        ))}
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
