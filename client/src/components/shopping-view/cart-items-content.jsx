import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleUpdateQuantity = async (typeOfAction) => {
    const newQuantity = typeOfAction === "plus" 
      ? cartItem.quantity + 1 
      : cartItem.quantity - 1;

    const product = productList.find(p => p._id === cartItem.productId);
    
    if (!product) {
      await dispatch(deleteCartItem(cartItem.productId));
      toast({
        title: "Product not found",
        variant: "destructive",
      });
      
      return;
    }

    if (typeOfAction === "plus" && newQuantity > product.totalStock) {
      toast({
        title: `Only ${product.totalStock} units available`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await dispatch(updateCartQuantity({
        productId: cartItem.productId,
        quantity: newQuantity
      }));

      if (response?.payload?.success) {
        toast({ title: "Cart updated successfully" });
      }
    } catch (error) {
      toast({
        title: "Failed to update cart",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async () => {
    try {
      const response = await dispatch(deleteCartItem(cartItem.productId));

      if (response?.payload?.success) {
        toast({ title: "Item removed from cart" });
      }
    } catch (error) {
      toast({
        title: "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-wrap items-center space-x-4">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity("minus")}
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity("plus")}
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          {formatCurrency(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          )}
        </p>
        <Trash
          onClick={handleDeleteItem}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;