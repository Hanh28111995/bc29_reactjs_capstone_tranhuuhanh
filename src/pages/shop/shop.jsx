import React, { useContext } from 'react'
import { Spin} from 'antd';
import { LoadingContext } from 'contexts/loading.context';
import "./../home/index.scss";
import ShopProductList from 'modules/itemLists/ShopProductList';


export default function Shop() {
  const [loadingState] = useContext(LoadingContext);

  return (
    <Spin spinning={loadingState.isLoading} size="large">      
      <div className='homePage'>        
        <ShopProductList />
      </div>
    </Spin>
  )
}
