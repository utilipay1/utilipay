"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { DataTableFacetedFilter } from "@/components/bills/data-table-faceted-filter"
import { Building, FileText } from "lucide-react"

export interface NotesFiltersState {
  type: Set<string>
  propertyId: Set<string>
  search: string
}

interface NotesToolbarProps {
  filters: NotesFiltersState
  setFilters: (filters: NotesFiltersState) => void
  properties: Record<string, string> // id -> address
}

export function NotesToolbar({
  filters,
  setFilters,
  properties,
}: NotesToolbarProps) {
  const isFiltered = 
    filters.type.size > 0 || 
    filters.propertyId.size > 0 ||
    filters.search.length > 0

  const handleReset = () => {
    setFilters({
      type: new Set(),
      propertyId: new Set(),
      search: "",
    })
  }

  const typeOptions = [
    { label: "Property", value: "property", icon: Building },
    { label: "Bill", value: "bill", icon: FileText },
  ]

  const propertyOptions = Object.entries(properties).map(([id, address]) => ({
    label: address,
    value: id,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Filter by source or content..."
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value })
            }
            className="h-8 w-full lg:w-[350px]"
          />
          
          <DataTableFacetedFilter
            title="Type"
            options={typeOptions}
            selectedValues={filters.type}
            onSelect={(values) => setFilters({ ...filters, type: values })}
          />

          <DataTableFacetedFilter
            title="Property"
            options={propertyOptions}
            selectedValues={filters.propertyId}
            onSelect={(values) => setFilters({ ...filters, propertyId: values })}
          />

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
