import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { withBadge } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

import HeaderButton from '../components/HeaderButton';
import Logo from '../components/Logo';

import Colors from '../constants/Colors';
import * as cartActions from '../store/actions/cart';
import * as variationActions from '../store/actions/variation';

const ProductDetailScreen = props => {
  const productId = props.navigation.getParam('productId');
  const selectedProduct = useSelector(state =>
    state.products.availableProducts.find(prod => prod.id === productId)
  );
  const variations = useSelector(state => state.variation.availableVariations);
  // console.log(variations);
  const dispatch = useDispatch();
  const totalItems = useSelector(state => state.cart.totalItems);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [variationOption, setVariationOption] = useState('Selecteaza');
  // const variation = variations.find((variation => variation.option === 'Selecteaza'));
  // console.log(variation); 
  const [variationId, setVariationId] = useState();
  const [price, setPrice] = useState();
  const placeholder = {
    str: 'Selecteaza'
  };

  let variationsOptions = [];
  for (const key in variations) {
    variationsOptions.push({
      label: variations[key].option,
      value: variations[key].option
    });
  }

  // const increaseQuantityHandler = (quantity) => {
  //   setQuantity
  // }

  const addToCartHandler = useCallback(() => {
    // console.log(selectedProduct, price, quantity, variationOption, productId, variationId);
    dispatch(cartActions.addToCart(selectedProduct, price, quantity, variationOption, productId, variationId));
  }, [dispatch, selectedProduct, price, quantity, variationOption, productId, variationId]);

  // const removefromCartHandler = useCallback(() => {
  //   dispatch(cartActions.removeFromCart(productId));
  // }, [dispatch, productId])

  useEffect(() => {
    setIsLoading(true);
    const loadVariations = async () => {
      try {
        await dispatch(variationActions.fetchVariations(productId));
      } catch (err) {
        setError(err.message);
        // console.log(err.message);
      };
    };
    loadVariations();
    setIsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    props.navigation.setParams({totalItemsCount: totalItems});
  }, [totalItems]);

  const updatePrice = (varOption) => {
    for (const key in variations) {
      if (variations[key].option === varOption) {
        setVariationOption(variations[key].option);
        setPrice(variations[key].price);
        setVariationId(variations[key].id);
        // console.log(variations);
      }
    }
  };

  return (
    <ScrollView>
      <View style={styles.imageContainer}><Image style={styles.image} source={{ uri: selectedProduct.imageUrl }} /></View>
      <Text style={styles.title}>{selectedProduct.name}</Text>
      <View style={styles.filtersContainer}>
        <View style={styles.priceContainer}><Text style={styles.price}>{price} RON</Text></View>
        <View style={styles.variationsContainer}>
          <Text style={styles.pickerLabel}>  Marime: </Text>
          <RNPickerSelect
              items={variationsOptions}
              placeholder={{}}
              doneText="Gata"
              // label="Marime" 
              value={variationOption}
              style={styles.variationPicker}
              onValueChange={(variationOption) => {
                setVariationOption(variationOption)
                updatePrice(variationOption);
              }}
            />
          </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.quantityContainer}>
            {/* {props.deletable && ( */}
            <TouchableOpacity
              style={styles.controller}
              onPress={() => {
                if (quantity > 1) {
                  setQuantity(quantity - 1);
                }
              }}
            >
              <Ionicons
                name={'ios-remove'}
                size={36}
                color={'white'}
              />
            </TouchableOpacity>
            <View style={styles.quantityBox}>
              <Text style={styles.quantity}>{quantity}</Text>
            </View>
            <TouchableOpacity
              style={styles.controller}
              onPress={() => 
                setQuantity(quantity + 1)
              }
            >
              <Ionicons
                name={'ios-add'}
                size={36}
                color={'white'}
              />
            </TouchableOpacity> 
          </View>
        <TouchableOpacity 
          style={styles.addToCartButton}
          disabled={variationOption == 'Selecteaza'}
          onPress={addToCartHandler}>
            <View style={styles.addToCartButton}>
              <Text style={styles.addToCartText}>Adauga in Cos</Text>  
              <Ionicons
                onPress={addToCartHandler}
                name={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
                size={24}
                color={'white'}
              />
            </View>
        </TouchableOpacity> 
      </View>
      <Text style={styles.description}>{selectedProduct.description.replace(/<[^>]*>/g, '')}</Text>
    </ScrollView>
  );
};

ProductDetailScreen.navigationOptions = navData => {
  let itemsCount = navData.navigation.getParam('totalItemsCount');
  const ItemsCart = withBadge(itemsCount, {
    bottom: 0,
    right: 0,
    badgeStyle: {
      backgroundColor: Colors.accent
    }
  })(HeaderButton);
  return {
    headerStyle: {
      backgroundColor: 'white'
    },
    headerTintColor: Colors.primary,
    headerTitle: <Logo title={'G a r d e n i a'} />,
    headerRight: (
      <HeaderButtons HeaderButtonComponent={(itemsCount == 0) ? HeaderButton : ItemsCart}>
        <Item
          style={styles.cart}
          title="Cart"
          iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
          onPress={() => {
            navData.navigation.navigate('Cart');
          }}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  addToCartButton: {
    marginRight: 8,
    marginLeft: 24,
    height: 40,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.accent,
    borderRadius: 8
  },
  imageContainer: {
    height: Dimensions.get('window').height / 1.6
  },
  addToCartText: {
    color: 'white'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  cart: {
    marginRight: 4
  },
  pickerLabel: {
    textAlign: 'left'
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  filtersContainer: {
    maxHeight: 64,
    // paddingVertical: 32,
    marginTop: 4,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
  },
  variationsContainer: {
    flexDirection: 'row',
    flex: 1,
    height: 40,
    // width: Dimensions.get('window').width / 2.25,
    // width: 150,
    backgroundColor: '#dbe1e1',
    marginRight: 24,
    marginBottom: 4,
    justifyContent: 'flex-start',
    borderRadius: 8,
    // justifyContent: 'center',
    alignContent: 'center',
    paddingTop: 12
  },
  priceContainer: {
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  variationPicker: {
     width: '90%',
  },
  price: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'montserrat'
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f1f3',
  },
  title: {
    fontFamily: 'playfair',
    fontSize: 24,
    textAlign: 'center',
    margin: 8,
    color: Colors.primary
  },
  description: {
    fontFamily: 'montserrat',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20
  },
  quantityBox: {
    width: 64,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controller: {
    height: 40,
    width: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary
  },
  quantity: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'playfair',
    paddingBottom: 8
  }
});

export default ProductDetailScreen;
