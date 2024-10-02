import { emptySellerData } from 'src/shared/utils/static-data';
import { createSlice, Slice } from '@reduxjs/toolkit';
import { IReduxSeller, ISellerDocument } from 'src/features/seller/interfaces/seller.interface';

const initialValue: ISellerDocument = emptySellerData;

const sellerSlice: Slice = createSlice({
  name: 'seller',
  initialState: initialValue,
  reducers: {
    addSeller: (state: ISellerDocument, action: IReduxSeller) => {
      if (!action.payload) {
        return state;
      }
      state = { ...action.payload };
      return state;
    },
    emptySeller: (): ISellerDocument => {
      return emptySellerData;
    },
  },
});

export const { addSeller, emptySeller } = sellerSlice.actions;
export default sellerSlice.reducer;
