import React from "react";

import "./../home/index.scss";
import PromotionList from "modules/itemLists/PromotionList";

export default function Promotion() {
  return (
    <div className="homePage">
      <PromotionList />
    </div>
  );
}
