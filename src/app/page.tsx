import { AddPropertyForm } from "@/components/properties/AddPropertyForm";
import { PropertyList } from "@/components/properties/PropertyList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Property Management</h1>
      
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Property List</TabsTrigger>
          <TabsTrigger value="add">Add Property</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <PropertyList />
        </TabsContent>
        
        <TabsContent value="add" className="space-y-4">
          <div className="max-w-md border p-6 rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">Add New Property</h2>
            <AddPropertyForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}