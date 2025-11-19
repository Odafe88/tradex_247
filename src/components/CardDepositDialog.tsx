import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CardDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CardDepositDialog = ({ open, onOpenChange }: CardDepositDialogProps) => {
  const [cardDetails, setCardDetails] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    bankName: "",
    amount: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!cardDetails.cardHolderName || !cardDetails.cardNumber || !cardDetails.bankName || !cardDetails.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(cardDetails.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const lastFour = cardDetails.cardNumber.slice(-4);
      
      const { error } = await supabase
        .from('card_deposits')
        .insert({
          user_id: user.id,
          card_holder_name: cardDetails.cardHolderName,
          last_four_digits: lastFour,
          bank_name: cardDetails.bankName,
          amount: amount,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Card deposit submitted successfully. Pending verification.",
      });

      setCardDetails({
        cardHolderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        bankName: "",
        amount: "",
      });

      queryClient.invalidateQueries({ queryKey: ['cardDeposits'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Card deposit error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit card deposit",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <DialogTitle>Deposit with Card</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardHolderName">Card Holder Name *</Label>
            <Input
              id="cardHolderName"
              placeholder="John Doe"
              value={cardDetails.cardHolderName}
              onChange={(e) => setCardDetails({ ...cardDetails, cardHolderName: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.cardNumber}
              onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value.replace(/\s/g, '') })}
              maxLength={16}
            />
            <p className="text-xs text-muted-foreground mt-1">Only last 4 digits will be stored securely</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={cardDetails.expiryDate}
                onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                maxLength={4}
              />
              <p className="text-xs text-muted-foreground mt-1">Not stored</p>
            </div>
          </div>

          <div>
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              placeholder="Bank of America"
              value={cardDetails.bankName}
              onChange={(e) => setCardDetails({ ...cardDetails, bankName: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="amount">Deposit Amount (USD) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="100.00"
              value={cardDetails.amount}
              onChange={(e) => setCardDetails({ ...cardDetails, amount: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="font-medium text-blue-400 mb-2 text-sm">Security Notice</h3>
            <p className="text-xs text-muted-foreground">
              Your card details are handled securely. We only store the last 4 digits of your card number. 
              CVV is never stored. All deposits are subject to verification.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Submit Deposit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
