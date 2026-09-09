import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { adminDeleteCoupon, adminListCoupons, adminSaveCoupon } from '../../services/api.js';

export default function AdminCoupons() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [code, setCode] = useState('PSGOLD');
  const [percent, setPercent] = useState(10);
  const { data = [], refetch } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminListCoupons(token),
  });

  const save = async (event) => {
    event.preventDefault();
    try {
      await adminSaveCoupon({ code, percent: Number(percent), active: true }, token);
      pushToast('Coupon saved');
      refetch();
    } catch (error) {
      pushToast(error.response?.data?.error || 'Could not save coupon.', 'error');
    }
  };

  const remove = async (couponCode) => {
    try {
      await adminDeleteCoupon(couponCode, token);
      pushToast('Coupon removed');
      refetch();
    } catch (error) {
      pushToast(error.response?.data?.error || 'Could not delete coupon.', 'error');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <form className="space-y-4 rounded-[1.5rem] bg-white p-6 shadow-soft" onSubmit={save}>
        <h2 className="text-xl font-semibold">New coupon</h2>
        <Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Code" />
        <Input
          type="number"
          value={percent}
          onChange={(event) => setPercent(event.target.value)}
          placeholder="Percent"
        />
        <Button type="submit">Save coupon</Button>
      </form>
      <div className="space-y-3">
        {data.map((coupon) => (
          <div
            key={coupon.code}
            className="flex items-center justify-between rounded-[1.25rem] bg-white px-5 py-4 shadow-soft"
          >
            <div>
              <p className="font-semibold">{coupon.code}</p>
              <p className="text-sm text-gray-500">{coupon.percent}% off</p>
            </div>
            <button type="button" className="text-sm font-semibold text-red-600" onClick={() => remove(coupon.code)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
