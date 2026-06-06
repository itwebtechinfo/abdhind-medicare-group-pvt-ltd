import { Pill, Plus, Search, Filter, AlertCircle, CheckCircle2, Package, MoreVertical, Download } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export const metadata = { title: "Pharmacy | MediCare ERP" };

const MOCK_INVENTORY = [
  { id: "MED-001", name: "Amoxicillin 500mg", category: "Antibiotic", stock: 450, status: "In Stock", price: "$12.00" },
  { id: "MED-002", name: "Ibuprofen 400mg", category: "Painkiller", stock: 12, status: "Low Stock", price: "$8.50" },
  { id: "MED-003", name: "Lisinopril 10mg", category: "Blood Pressure", stock: 0, status: "Out of Stock", price: "$15.00" },
  { id: "MED-004", name: "Metformin 20mg", category: "Diabetes", stock: 120, status: "In Stock", price: "$10.00" },
  { id: "MED-005", name: "Atorvastatin 500mg", category: "Cholesterol", stock: 55, status: "In Stock", price: "$9.00" },
];

export default function PharmacyPage() {
  return (
    <ErpPageShell
      title="Pharmacy"
      description="Manage pharmacy inventory, prescriptions, and billing."
      icon={Pill}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 hidden sm:flex">
            <Download className="h-4 w-4" />
            <span>Export List</span>
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Medicine</span>
          </Button>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+12 new items this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Requires immediate restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prescriptions Filled</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Processed today</p>
          </CardContent>
        </Card>
      </div>

      {/* Pharmacy Inventory Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold">Medicine Inventory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="h-10 px-4 font-medium">Item Code</th>
                  <th className="h-10 px-4 font-medium">Name</th>
                  <th className="h-10 px-4 font-medium">Category</th>
                  <th className="h-10 px-4 font-medium">Status</th>
                  <th className="h-10 px-4 font-medium text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t">
                {MOCK_INVENTORY.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{item.id}</td>
                    <td className="p-4">{item.name}</td>
                    <td className="p-4 text-muted-foreground">{item.category}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.status === 'In Stock' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                        item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        {item.status} ({item.stock})
                      </span>
                    </td>
                    <td className="p-4 text-right">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </ErpPageShell>
  );
}