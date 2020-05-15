import ShopWooCommerceAPI from '../../constants/ShopWooCommerceAPI';
import Variation from '../../models/variation';

export const SET_VARIATIONS = 'SET_VARIATIONS';

export const fetchVariations = (productId) => {
    let isLoading;
    return async dispatch => {
  
      await ShopWooCommerceAPI.get('products/' + productId + '/variations', {
      })
      .then(data => {
        const loadedVariations = [];
        const select = new Variation(-1, 'Selecteaza' );
        loadedVariations.push(select);
        // console.log(data, loadedVariations);
    
        for (const key in data) {
          loadedVariations.push(
            new Variation(
              data[key].id,
              data[key].attributes[0].option,
              data[key].price,
            )
          );
        }
        // console.log(loadedVariations);
        isLoading = false;
        dispatch({ type: SET_VARIATIONS, variations: loadedVariations });
      })
      .catch(error => {
        // console.log(error);
        isLoading = false;
      });
        
    };
  };
  