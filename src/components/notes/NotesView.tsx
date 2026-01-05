"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Building, FileText } from "lucide-react";
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

type Property = z.infer<typeof PropertySchema>;
type Bill = z.infer<typeof BillSchema>;

interface NoteItem {
  id: string;
  type: "property" | "bill";
  sourceName: string; // Address for property, Utility + Property for bill
  content: string;
  propertyId: string; // Added for filtering
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
        fetch("/api/bills?archived=true"), // Fetch archived as well
      ]);
      
      const billsResActive = await fetch("/api/bills");
      
      if (propsRes.ok && billsRes.ok && billsResActive.ok) {
        const propsData: Property[] = await propsRes.json();
        const billsDataArchived: Bill[] = await billsRes.json();
        const billsDataActive: Bill[] = await billsResActive.json();
        
        // Merge and deduplicate bills based on ID
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
    // Search Filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSource = note.sourceName.toLowerCase().includes(searchLower);
      const matchesContent = note.content.toLowerCase().includes(searchLower);
      if (!matchesSource && !matchesContent) return false;
    }

    // Type Filter
    if (filters.type.size > 0 && !filters.type.has(note.type)) {
      return false;
    }

    // Property Filter
    if (filters.propertyId.size > 0 && !filters.propertyId.has(note.propertyId)) {
      return false;
    }

    return true;
  });

  if (loading) return <div>Loading notes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
      </div>

      <NotesToolbar 
        filters={filters} 
        setFilters={setFilters} 
        properties={propertiesMap} 
      />

      <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="max-w-[400px]">Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                  No notes found.
                </TableCell>
              </TableRow>
            ) : (
              filteredNotes.map((note) => (
                <TableRow key={`${note.type}-${note.id}`} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="capitalize font-medium">
                    <div className="flex items-center gap-2">
                      {note.type === 'property' ? <Building className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                      {note.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{note.sourceName}</span>
                      {note.date && (
                        <span className="text-xs text-muted-foreground">Due: {note.date}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[400px] truncate" title={note.content}>
                    {note.content}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground mb-2">
              Source: <span className="font-semibold text-foreground">{editingNote?.sourceName}</span>
            </div>
            <Textarea
              value={editContent}
              onChange={(e) => setEditName(e.target.value)}
              className="min-h-[200px]"
              placeholder="Write your note here..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSave} className="cursor-pointer">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}