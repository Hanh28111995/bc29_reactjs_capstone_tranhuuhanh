import React, { useContext } from 'react'
import { Spin} from 'antd';
import { LoadingContext } from 'contexts/loading.context';
import "./../home/index.scss";
import ShopProduct from 'modules/itemLists/ShopProduct';

export default function Shop() {
  const [loadingState] = useContext(LoadingContext);

  return (
    <Spin spinning={loadingState.isLoading} size="large">      
      <div className='homePage'>        
        <ShopProduct />
      </div>
    </Spin>
  )
}
