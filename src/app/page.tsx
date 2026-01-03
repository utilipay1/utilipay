import { AddPropertyForm } from "@/components/properties/AddPropertyForm";
import { PropertyList } from "@/components/properties/PropertyList";
import { AddBillForm } from "@/components/bills/AddBillForm";
import { BillsDueSoon } from "@/components/dashboard/BillsDueSoon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Utilipay Management</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">Properties</TabsTrigger>
          <TabsTrigger value="add-property">Add Property</TabsTrigger>
          <TabsTrigger value="add-bill">Add Bill</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <BillsDueSoon />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <PropertyList />
        </TabsContent>
        
        <TabsContent value="add-property" className="space-y-4">
          <div className="max-w-md border p-6 rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">Add New Property</h2>
            <AddPropertyForm />
          </div>
        </TabsContent>

        <TabsContent value="add-bill" className="space-y-4">
          <div className="max-w-md border p-6 rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">Add New Bill</h2>
            <AddBillForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}