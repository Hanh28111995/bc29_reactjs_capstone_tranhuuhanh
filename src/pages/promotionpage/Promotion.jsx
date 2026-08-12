import React, { useContext } from 'react'
import { Spin} from 'antd';
import { LoadingContext } from 'contexts/loading.context';
import "./../home/index.scss";
import PromotionList from 'modules/itemLists/PromotionList';

export default function Promotion() {
  const [loadingState] = useContext(LoadingContext);

  return (
    <Spin spinning={loadingState.isLoading} size="large">      
      <div className='homePage'>        
        <PromotionList />
      </div>
    </Spin>
  )
}
