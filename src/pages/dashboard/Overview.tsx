import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const chartData = [
  { time: "2:00pm", btc: 8420, eth: 2980 },
  { time: "3:00pm", btc: 8200, eth: 2850 },
  { time: "4:00pm", btc: 8350, eth: 2920 },
  { time: "5:00pm", btc: 8500, eth: 3010 },
  { time: "6:00pm", btc: 8450, eth: 2950 },
  { time: "7:00pm", btc: 8650, eth: 3050 },
  { time: "8:00pm", btc: 8750, eth: 3100 },
  { time: "9:00pm", btc: 8420, eth: 2980 },
];

const paymentHistory = [
  { name: "Achain", icon: "🔵", change: "-8.43%", date: "12 Jun, 2024", price: "$14,923.33", status: "Successfully", positive: false },
  { name: "Cardano", icon: "🔷", change: "+2.94%", date: "16 May, 2024", price: "$2,439.90", status: "Pending", positive: true },
  { name: "Digibyte", icon: "🔹", change: "+16.84", date: "21 Feb, 2024", price: "$219", status: "Failed", positive: true },
  { name: "Ethereum", icon: "💎", change: "-34.34%", date: "19 Dec, 2023", price: "$5,891", status: "Failed", positive: false },
];

const Overview = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Ilona</h1>
          <p className="text-muted-foreground">Here's take a look at your performance and analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            January 2024 - May 2024
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add new coin
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="text-xs text-muted-foreground mb-2">PROFIT THIS MONTH</div>
                <div className="text-3xl font-bold mb-3">$5,950.64</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">24H% CHANGE</span>
                    <span className="text-primary">↑ 2.34%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VOLUME (24H)</span>
                    <span>$84.42B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MARKET CAP</span>
                    <span>$804.42B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">AVG MONTHLY GROWING</span>
                    <span>$801.42B</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-6 flex items-center justify-center">
                <Button variant="default" className="gap-2 bg-primary text-primary-foreground">
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Trade</span>
                <div className="flex gap-4 text-sm font-normal">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">1 BTC</span>
                    <span className="font-semibold">$8,420.04</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">1 ETH</span>
                    <span className="font-semibold">$2,980.81</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Line type="monotone" dataKey="btc" stroke="#4ADE80" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="eth" stroke="#FBBF24" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          {/* Credit Score */}
          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-4">Percentage Profit</div>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="hsl(var(--muted))"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#4ADE80"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${70 * 2 * Math.PI * 0.8} ${70 * 2 * Math.PI * 0.2}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-4xl font-bold">80%</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Last Check on 21 Apr</div>
                <div className="text-sm">Your credit score is <span className="font-semibold">average</span></div>
                <div className="text-xs text-primary mt-1">↑ 2.34%</div>
              </div>
            </CardContent>
          </Card>

          {/* Bitcoin Card */}
          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-2xl">
                  ₿
                </div>
                <div>
                  <div className="font-semibold">Bitcoin</div>
                  <div className="text-xs text-muted-foreground">BTC</div>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">Reward Rate</div>
              </div>
              <div className="text-3xl font-bold mb-2">$52,291</div>
              <div className="text-sm text-primary">+0.39%</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment History */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NAME</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>PRICE</TableHead>
                <TableHead>STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{payment.icon}</span>
                      <div>
                        <div className="font-medium">{payment.name}</div>
                        <div className={cn("text-sm", payment.positive ? "text-green-500" : "text-red-500")}>
                          {payment.change}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                  <TableCell className="font-medium">{payment.price}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-sm",
                      payment.status === "Successfully" && "text-green-500",
                      payment.status === "Pending" && "text-yellow-500",
                      payment.status === "Failed" && "text-red-500"
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
