"use client";

import { useEffect, useState, useCallback } from "react";
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

type UserNote = z.infer<typeof UserNoteSchema>;

export function NotesView() {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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
        fetchNotes();
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
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading notes...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">My Notes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Keep track of your thoughts and reminders.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="w-5 h-5" />
          New Note
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-md bg-muted/30 p-1.5 rounded-2xl border shadow-sm">
        <Input 
          placeholder="Search your notes..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none bg-transparent focus-visible:ring-0 text-base"
        />
        {search && (
          <Button variant="ghost" size="icon" onClick={() => setSearch("")} className="h-8 w-8 cursor-pointer rounded-xl">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-[3rem] bg-muted/5">
          <div className="p-6 bg-muted/50 rounded-full mb-6">
            <FileText className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-2xl font-bold text-muted-foreground">No notes found</h3>
          <p className="text-muted-foreground max-w-sm mt-2 text-lg leading-relaxed">
            {search ? "No notes match your search." : "Capture your thoughts. Start by creating your first note."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div 
              key={note._id} 
              className="group flex flex-col p-8 border-2 border-transparent rounded-[2.5rem] bg-card shadow-sm hover:shadow-xl hover:border-primary/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex-1 min-h-[140px]">
                <p className="text-xl leading-relaxed text-foreground font-medium whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-muted flex justify-between items-center text-sm text-muted-foreground/60 font-semibold">
                <span>{format(new Date(note.createdAt!), "PPP")}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(note)}
                    className="h-9 w-9 hover:text-primary hover:bg-primary/5 cursor-pointer rounded-xl"
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(note._id!)}
                    className="h-9 w-9 hover:text-destructive hover:bg-destructive/5 cursor-pointer rounded-xl"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[640px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-10 bg-muted/20 border-b">
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground">
              {editingNote ? "Edit Note" : "Create Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-10 space-y-8">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[350px] text-2xl p-0 border-none focus-visible:ring-0 shadow-none resize-none bg-transparent font-medium leading-relaxed placeholder:text-muted-foreground/30"
              placeholder="What's on your mind?..."
              autoFocus
            />
            <div className="flex justify-end gap-4 pt-6 border-t border-muted/50">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="cursor-pointer font-bold px-10 rounded-2xl h-14 text-lg">
                Cancel
              </Button>
              <Button onClick={handleSave} className="cursor-pointer font-bold px-12 rounded-2xl h-14 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                {editingNote ? "Save Changes" : "Create Note"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}