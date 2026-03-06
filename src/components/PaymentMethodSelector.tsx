import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Building2, Smartphone, Wallet, Zap } from 'lucide-react';

export type PaymentMethodType = 'card' | 'bank_transfer' | 'ussd' | 'opay' | 'mobile_money';

interface PaymentMethodOption {
  value: PaymentMethodType;
  label: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

interface PaymentMethodSelectorProps {
  value: PaymentMethodType;
  onChange: (value: PaymentMethodType) => void;
  disabled?: boolean;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    value: 'opay',
    label: 'OPay',
    description: 'Fast and secure payment with OPay wallet',
    icon: <Zap className="w-5 h-5 text-green-600" />,
    popular: true,
  },
  {
    value: 'card',
    label: 'Debit/Credit Card',
    description: 'Pay with Mastercard, Visa, or Verve',
    icon: <CreditCard className="w-5 h-5 text-blue-600" />,
    popular: true,
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Direct transfer from your bank account',
    icon: <Building2 className="w-5 h-5 text-purple-600" />,
  },
  {
    value: 'ussd',
    label: 'USSD',
    description: 'Pay with USSD code (*737# etc.)',
    icon: <Smartphone className="w-5 h-5 text-orange-600" />,
  },
  {
    value: 'mobile_money',
    label: 'Mobile Money',
    description: 'Pay with MTN, Airtel, or other mobile money',
    icon: <Wallet className="w-5 h-5 text-indigo-600" />,
  },
];

export function PaymentMethodSelector({ value, onChange, disabled }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to pay for your levy
        </p>
      </div>

      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as PaymentMethodType)}
        disabled={disabled}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {paymentMethods.map((method) => (
          <div key={method.value} className="relative">
            <RadioGroupItem
              value={method.value}
              id={method.value}
              className="peer sr-only"
            />
            <Label
              htmlFor={method.value}
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                hover:border-gray-300 hover:bg-gray-50
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="mt-0.5">{method.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{method.label}</span>
                  {method.popular && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Payment method specific info */}
      {value === 'opay' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <p className="text-sm text-green-800">
              <strong>OPay:</strong> You'll be redirected to OPay to complete your payment securely.
              Make sure you have the OPay app installed or your OPay account details ready.
            </p>
          </CardContent>
        </Card>
      )}

      {value === 'card' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-800">
              <strong>Card Payment:</strong> We accept Mastercard, Visa, Verve, and other major cards.
              Your card details are encrypted and secure.
            </p>
          </CardContent>
        </Card>
      )}

      {value === 'bank_transfer' && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <p className="text-sm text-purple-800">
              <strong>Bank Transfer:</strong> You'll receive account details to complete the transfer.
              Payment confirmation may take a few minutes.
            </p>
          </CardContent>
        </Card>
      )}

      {value === 'ussd' && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4">
            <p className="text-sm text-orange-800">
              <strong>USSD:</strong> You'll receive a USSD code to dial on your phone.
              Works on all phones, no internet required.
            </p>
          </CardContent>
        </Card>
      )}

      {value === 'mobile_money' && (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-4">
            <p className="text-sm text-indigo-800">
              <strong>Mobile Money:</strong> Pay directly from your mobile money wallet.
              Supports MTN, Airtel, and other providers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
