import { getAllOrder, deleteOrder } from "./FetchApi";

export const fetchData = async (dispatch) => {
  dispatch({ type: "loading", payload: true });
  let responseData = await getAllOrder();
  setTimeout(() => {
    if (responseData) {
      dispatch({
        type: "fetchOrderAndChangeState",
        payload: responseData.orders,
      });
      dispatch({ type: "loading", payload: false });
    }
  }, 1);
};

/* This method call the editmodal & dispatch category context */
export const editOrderReq = (oId, type, status, dispatch) => {
  if (type) {
    console.log("click update");
    dispatch({ type: "updateOrderModalOpen", oId: oId, status: status });
  }
};

export const deleteOrderReq = async (oId, dispatch) => {
  let responseData = await deleteOrder(oId);
  console.log(responseData);
  if (responseData && responseData.success) {
    fetchData(dispatch);
  }
};

/* Filter All Order */
export const filterOrder = async (
  type,
  data,
  dispatch,
  dropdown,
  setDropdown
) => {
  let responseData = await getAllOrder();
  if (responseData && responseData.orders) {
    let newData;
    if (type === "All") {
      dispatch({
        type: "fetchOrderAndChangeState",
        payload: responseData.orders,
      });
      setDropdown(!dropdown);
    } else if (type === "Order placed") {
      newData = responseData.orders.filter(
        (item) => item.status === "Order placed"
      );
      dispatch({ type: "fetchOrderAndChangeState", payload: newData });
      setDropdown(!dropdown);
    } else if (type === "Processing") {
      newData = responseData.Orders.filter(
        (item) => item.status === "Processing"
      );
      dispatch({ type: "fetchOrderAndChangeState", payload: newData });
      setDropdown(!dropdown);
    } else if (type === "Shipped") {
      newData = responseData.Orders.filter((item) => item.status === "Shipped");
      dispatch({ type: "fetchOrderAndChangeState", payload: newData });
      setDropdown(!dropdown);
    } else if (type === "Delivered") {
      newData = responseData.Orders.filter(
        (item) => item.status === "Delivered"
      );
      dispatch({ type: "fetchOrderAndChangeState", payload: newData });
      setDropdown(!dropdown);
    } else if (type === "Cancelled") {
      newData = responseData.Orders.filter(
        (item) => item.status === "Cancelled"
      );
      dispatch({ type: "fetchOrderAndChangeState", payload: newData });
      setDropdown(!dropdown);
    }
  }
};
