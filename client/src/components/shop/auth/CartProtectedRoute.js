import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticate } from "./fetchApi";

const CartProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const isUserAuthenticated = isAuthenticate();
      
      if (!isUserAuthenticated) {
        return (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location },
            }}
          />
        );
      }

      return <Component {...props} />;
    }}
  />
);

export default CartProtectedRoute;
