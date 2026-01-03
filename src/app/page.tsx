import { AddPropertyForm } from "@/components/properties/AddPropertyForm";
import { PropertyList } from "@/components/properties/PropertyList";
import { AddBillForm } from "@/components/bills/AddBillForm";
import { BillList } from "@/components/bills/BillList";
import { BillsDueSoon } from "@/components/dashboard/BillsDueSoon";
import { PortfolioTable } from "@/components/dashboard/PortfolioTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your property utilities and upcoming bills.</p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="bills">All Bills</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-10">
          <section>
            <BillsDueSoon />
          </section>
          <section>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Portfolio Status</h2>
            <PortfolioTable />
          </section>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <PropertyList />
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <BillList />
        </TabsContent>
        
        <TabsContent value="manage" className="grid gap-8 md:grid-cols-2">
          <div className="border p-6 rounded-xl bg-card shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Add New Property</h2>
            <AddPropertyForm />
          </div>
          <div className="border p-6 rounded-xl bg-card shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Add New Bill</h2>
            <AddBillForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}