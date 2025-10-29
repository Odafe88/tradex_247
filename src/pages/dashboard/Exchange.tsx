import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp } from "lucide-react";

const Exchange = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Exchange</h1>
        <p className="text-muted-foreground">Swap cryptocurrencies instantly</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Swap Crypto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">From</label>
              <div className="flex gap-2">
                <Select defaultValue="btc">
                  <SelectTrigger className="w-[180px] bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="flex-1 bg-background border-border"
                />
              </div>
              <div className="text-sm text-muted-foreground mt-1">Balance: 0.5432 BTC</div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowDownUp className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">To</label>
              <div className="flex gap-2">
                <Select defaultValue="eth">
                  <SelectTrigger className="w-[180px] bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="flex-1 bg-background border-border"
                  disabled
                />
              </div>
              <div className="text-sm text-muted-foreground mt-1">Balance: 5.2341 ETH</div>
            </div>

            <Card className="bg-muted">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-medium">1 BTC = 17.52 ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee (0.5%)</span>
                  <span className="font-medium">0.00027 BTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Time</span>
                  <span className="font-medium">~2 minutes</span>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
              Exchange Now
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card mt-6">
          <CardHeader>
            <CardTitle>Recent Exchanges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No recent exchanges found
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Exchange;
