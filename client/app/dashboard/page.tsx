"use client"

import React, { useState, useEffect, useCallback } from "react"
import { FileGrid } from "../components/dashboard/file-grid"
import { FileList } from "../components/dashboard/file-list"
import { UploadButton } from "../components/dashboard/upload-button"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Tabs, TabsContent } from "../components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb"
import { Grid, List, Loader2, FolderPlus } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { User } from "firebase/auth"
import { signInWithGoogle, signOutUser, subscribeToAuthStateChanges, uploadFile, db, collection, addDoc, query, where, getDocs, doc, getDoc } from "@/lib/firebase/clientApp"
import type { FileType } from "../types/files"
import { Timestamp } from "firebase/firestore"

export default function DashboardPage() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [files, setFiles] = useState<FileType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [parentFolders, setParentFolders] = useState<{ id: string; name: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateChanges((user) => {
      setCurrentUser(user)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const fetchFiles = useCallback(async (parentId: string | null = null) => {
    if (!currentUser) return
    setIsLoading(true)
    try {
      const filesQuery = query(
        collection(db, "files"),
        where("userId", "==", currentUser.uid),
        where("parentId", "==", parentId)
      )
      const querySnapshot = await getDocs(filesQuery)
      const filesData: FileType[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        name: doc.data().name,
        type: doc.data().type,
        parentId: doc.data().parentId,
        storagePath: doc.data().storagePath,
        isPublic: doc.data().isPublic,
        createdAt: doc.data().createdAt.toDate().toISOString(),
      }))
      setFiles(filesData)
    } catch {
      console.error("Error fetching files")
      toast({
        title: "Error",
        description: "Failed to load files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentUser, toast])

  const fetchFolderPath = async (folderId: string): Promise<{ id: string; name: string }[]> => {
    try {
      const folderDoc = await getDoc(doc(db, "files", folderId))
      if (!folderDoc.exists()) {
        return []
      }
      const folderData = folderDoc.data()
      const currentFolder = { id: folderDoc.id, name: folderData.name }
      if (folderData.parentId) {
        const parentPath = await fetchFolderPath(folderData.parentId)
        return [...parentPath, currentFolder]
      }
      return [currentFolder]
    } catch {
      console.error("Error fetching folder path")
      return []
    }
  }

  const navigateToFolder = async (folderId: string | null) => {
    setCurrentFolder(folderId)
    if (folderId) {
      const path = await fetchFolderPath(folderId)
      setParentFolders(path)
    } else {
      setParentFolders([])
    }
    fetchFiles(folderId)
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      })
      return
    }
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a folder",
        variant: "destructive",
      })
      return
    }

    setIsCreatingFolder(true)
    try {
      await addDoc(collection(db, "files"), {
        name: newFolderName,
        type: "folder",
        parentId: currentFolder,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
      })
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
      setNewFolderName("")
      fetchFiles(currentFolder)
    } catch {
      console.error("Error creating folder")
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch {
      toast({
        title: "Error",
        description: "Failed to sign in.",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      setFiles([])
      setCurrentFolder(null)
      setParentFolders([])
    } catch {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      })
      return
    }
    setUploadStatus("Uploading...")
    try {
      const storagePath = `${currentUser.uid}/${currentFolder || "documents"}/${file.name}`
      await uploadFile(file, currentUser.uid, currentFolder || "documents")
      await addDoc(collection(db, "files"), {
        name: file.name,
        type: "file",
        parentId: currentFolder,
        userId: currentUser.uid,
        storagePath,
        createdAt: Timestamp.now(),
      })
      setUploadStatus("Upload successful!")
      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
      fetchFiles(currentFolder)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUploadStatus(`Upload failed: ${error.message}`)
      } else {
      setUploadStatus(`Upload failed: Unknown error`)
      }
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    if (currentUser) {
      fetchFiles(currentFolder)
    }
  }, [currentFolder, currentUser, fetchFiles])

  if (!currentUser) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <p className="text-lg">Please sign in to access your files.</p>
        <Button onClick={handleGoogleSignIn} className="mt-4">
          Sign In with Google
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
          <Breadcrumb className="mt-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigateToFolder(null)} className="cursor-pointer">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              {parentFolders.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === parentFolders.length - 1 ? (
                      <span>{folder.name}</span>
                    ) : (
                      <BreadcrumbLink onClick={() => navigateToFolder(folder.id)} className="cursor-pointer">
                        {folder.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-muted" : ""}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-muted" : ""}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[200px] md:w-[300px]"
            />
            <UploadButton
              currentFolder={currentFolder}
              onUploadComplete={(file) => handleFileUpload(file)}
            />
            <Button onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsCreatingFolder(!isCreatingFolder)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>

        {isCreatingFolder && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-[200px]"
            />
            <Button size="sm" onClick={handleCreateFolder} disabled={isCreatingFolder && !newFolderName.trim()}>
              {isCreatingFolder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreatingFolder(false)
                setNewFolderName("")
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {uploadStatus && <p className="text-sm">{uploadStatus}</p>}

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="text-4xl">📁</div>
          <h3 className="mt-4 text-lg font-semibold">No files found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery ? "Try a different search term" : "Upload files or create a folder to get started"}
          </p>
        </div>
      ) : (
        <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
          <TabsContent value="grid" className="mt-0">
            <FileGrid
              files={filteredFiles}
              onFolderClick={(folderId) => navigateToFolder(folderId)}
              onRefresh={() => fetchFiles(currentFolder)}
            />
          </TabsContent>
          <TabsContent value="list" className="mt-0">
            <FileList
              files={filteredFiles}
              onFolderClick={(folderId) => navigateToFolder(folderId)}
              onRefresh={() => fetchFiles(currentFolder)}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}