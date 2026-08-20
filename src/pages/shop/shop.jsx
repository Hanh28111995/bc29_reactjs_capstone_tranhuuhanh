import React from "react";
import "./../home/index.scss";
import ShopProductList from "modules/itemLists/ShopProductList";

export default function Shop() {
  return (
    <div className="homePage">
      <ShopProductList />
    </div>
  );
}
