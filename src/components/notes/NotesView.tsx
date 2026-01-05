"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Building, FileText, Calendar } from "lucide-react";
import { PropertySchema, BillSchema } from "@/lib/schemas";
import { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { NotesToolbar, NotesFiltersState } from "./NotesToolbar";
import { Badge } from "@/components/ui/badge";

type Property = z.infer<typeof PropertySchema>;
type Bill = z.infer<typeof BillSchema>;

interface NoteItem {
  id: string;
  type: "property" | "bill";
  sourceName: string; 
  content: string;
  propertyId: string;
  date?: string;
}

export function NotesView() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [propertiesMap, setPropertiesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [editContent, setEditName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filters, setFilters] = useState<NotesFiltersState>({
    type: new Set(),
    propertyId: new Set(),
    search: "",
  });

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const [propsRes, billsRes] = await Promise.all([
        fetch("/api/properties?archived=all"),
        fetch("/api/bills?archived=true"),
      ]);
      
      const billsResActive = await fetch("/api/bills");
      
      if (propsRes.ok && billsRes.ok && billsResActive.ok) {
        const propsData: Property[] = await propsRes.json();
        const billsDataArchived: Bill[] = await billsRes.json();
        const billsDataActive: Bill[] = await billsResActive.json();
        
        const allBills = [...billsDataActive, ...billsDataArchived];
        const uniqueBills = Array.from(new Map(allBills.map(item => [item._id, item])).values());

        const propsMap: Record<string, string> = {};
        propsData.forEach(p => {
          if (p._id) propsMap[p._id] = p.address;
        });
        setPropertiesMap(propsMap);

        const propertyNotes: NoteItem[] = propsData
          .filter(p => p.notes && p.notes.trim() !== "")
          .map(p => ({
            id: p._id!,
            type: "property",
            sourceName: p.address,
            content: p.notes!,
            propertyId: p._id!,
          }));

        const billNotes: NoteItem[] = uniqueBills
          .filter(b => b.notes && b.notes.trim() !== "")
          .map(b => ({
            id: b._id!,
            type: "bill",
            sourceName: `${b.utility_type} - ${propsMap[b.property_id] || "Unknown Property"}`,
            content: b.notes!,
            propertyId: b.property_id,
            date: format(new Date(b.due_date), "PP"),
          }));

        setNotes([...propertyNotes, ...billNotes]);
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

  const handleEdit = (note: NoteItem) => {
    setEditingNote(note);
    setEditName(note.content);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingNote) return;

    try {
      const url = editingNote.type === "property" 
        ? `/api/properties/${editingNote.id}` 
        : `/api/bills/${editingNote.id}`;
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editContent }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleDelete = async (note: NoteItem) => {
    if (!confirm("Are you sure you want to clear this note?")) return;

    try {
      const url = note.type === "property" 
        ? `/api/properties/${note.id}` 
        : `/api/bills/${note.id}`;
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "" }),
      });

      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSource = note.sourceName.toLowerCase().includes(searchLower);
      const matchesContent = note.content.toLowerCase().includes(searchLower);
      if (!matchesSource && !matchesContent) return false;
    }
    if (filters.type.size > 0 && !filters.type.has(note.type)) return false;
    if (filters.propertyId.size > 0 && !filters.propertyId.has(note.propertyId)) return false;
    return true;
  });

  if (loading) return <div>Loading notes...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Notes</h1>
        <p className="text-muted-foreground mt-2 text-lg">Quick insights and reminders for your properties and bills.</p>
      </div>

      <NotesToolbar 
        filters={filters} 
        setFilters={setFilters} 
        properties={propertiesMap} 
      />

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-muted/10">
          <div className="p-4 bg-muted rounded-full mb-4">
            <FileText className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-muted-foreground">No notes found</h3>
          <p className="text-muted-foreground max-w-xs mt-2">Adjust your filters or add notes to properties/bills to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div 
              key={`${note.type}-${note.id}`} 
              className="group flex flex-col justify-between p-6 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-widest px-2 py-0">
                    {note.type}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(note)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(note)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="min-h-[80px]">
                  <p className="text-lg leading-relaxed font-medium text-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold uppercase tracking-tight">
                  {note.type === 'property' ? <Building className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                  <span className="truncate max-w-[200px]">{note.sourceName}</span>
                </div>
                {note.date && (
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {note.date}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm font-bold text-primary px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
              {editingNote?.type === 'property' ? <Building className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span className="truncate">{editingNote?.sourceName}</span>
            </div>
            <Textarea
              value={editContent}
              onChange={(e) => setEditName(e.target.value)}
              className="min-h-[250px] text-lg p-4 rounded-xl border-2 focus-visible:ring-primary shadow-inner"
              placeholder="Write your note here..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer font-bold px-6">
                Cancel
              </Button>
              <Button onClick={handleSave} className="cursor-pointer font-bold px-6 shadow-lg shadow-primary/20">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
