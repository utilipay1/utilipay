"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, FileText, X } from "lucide-react";
import { UserNoteSchema } from "@/lib/schemas";
import { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import useSWR, { mutate } from "swr";
import { Skeleton } from "@/components/ui/skeleton";

type UserNote = z.infer<typeof UserNoteSchema>;

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function NotesView() {
  const { data: notes, isLoading } = useSWR<UserNote[]>("/api/notes", fetcher);
  
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleCreate = () => {
    setEditingNote(null);
    setEditContent("");
    setIsModalOpen(true);
  };

  const handleEdit = (note: UserNote) => {
    setEditingNote(note);
    setEditContent(note.content);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editContent.trim()) return;

    try {
      const url = editingNote ? `/api/notes/${editingNote._id}` : "/api/notes";
      const method = editingNote ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        mutate("/api/notes");
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mutate("/api/notes");
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  if (isLoading && !notes) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-12 w-48 mb-2" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>

        <Skeleton className="h-10 max-w-md rounded-2xl" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col p-8 border rounded-[2.5rem] bg-card shadow-sm h-[280px]">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              <div className="mt-8 pt-6 border-t border-dashed border-muted flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-1">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredNotes = (notes || []).filter((note) =>
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Keep track of your thoughts and reminders.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 font-bold cursor-pointer">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Input 
          placeholder="Search your notes..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-muted/20"
        />
        {search && (
          <Button variant="ghost" size="icon" onClick={() => setSearch("")} className="h-8 w-8 cursor-pointer">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isLoading && !notes ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[250px] rounded-xl" />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-xl bg-muted/5">
          <div className="p-6 bg-muted/50 rounded-full mb-6">
            <FileText className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold text-muted-foreground">No notes found</h3>
          <p className="text-muted-foreground max-w-sm mt-2 text-sm">
            {search ? "No notes match your search." : "Capture your thoughts. Start by creating your first note."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div 
              key={note._id} 
              onClick={() => handleEdit(note)}
              className="group flex flex-col p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden h-[280px]"
            >
              <div className="flex-1 overflow-hidden">
                <p className="text-lg leading-relaxed text-foreground font-medium whitespace-pre-wrap line-clamp-6">
                  {note.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-muted flex justify-between items-center text-xs text-muted-foreground/60 font-semibold" onClick={(e) => e.stopPropagation()}>
                <span>{format(new Date(note.createdAt!), "PPP")}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(note)}
                    className="h-8 w-8 hover:text-primary hover:bg-primary/5 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(note._id!)}
                    className="h-8 w-8 hover:text-destructive hover:bg-destructive/5 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-xl p-0 overflow-hidden border shadow-2xl">
          <DialogHeader className="p-6 bg-muted/20 border-b">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              {editingNote ? "Edit Note" : "Create Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[250px] text-lg p-0 border-none focus-visible:ring-0 shadow-none resize-none bg-transparent font-medium leading-relaxed placeholder:text-muted-foreground/30"
              placeholder="What's on your mind?..."
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="cursor-pointer font-bold px-6">
                Cancel
              </Button>
              <Button onClick={handleSave} className="cursor-pointer font-bold px-8">
                {editingNote ? "Save Changes" : "Create Note"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}