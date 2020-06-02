import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    Dimensions, StyleSheet, Image
} from 'react-native';

import Toast from 'react-native-simple-toast';
import { withNavigationFocus } from 'react-navigation';
import { localhost } from './localhost';

import Global from './Global';
import Header from './Header';
import checkout from './api/checkout';
import getToken from './api/getToken';
import removeCart from './api/removeCart';


// function toTitleCase(str) {
//   return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
// }

const imageUrl = `http://${localhost}/AppBanHangServer/images/product/`;

class Cart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refresh: false,
        };
    }

    onCheckout(arrCart) {
        const arrDetail = arrCart.map(e => ({ id: e.product.id, quantity: e.quantity }));
        getToken()
            .then(token => checkout(token, arrDetail))
            .then(res => {
                if (res === 'THEM_THANH_CONG') {
                    Global.removeCart();
                    this.setState({ refresh: !this.state.refresh }); //render lai 
                    Toast.show('Order successfully!', Toast.LONG);
                } else {
                    Toast.show('Order failed!', Toast.LONG);
                }
            })
            .catch(err => console.log(err));
    }

    increaseQuantity(id) {
        Global.increaseQuantity(id);
        this.setState({ refresh: !this.state.refresh },
            () => this.forceUpdate() // render lai 2 lan, lenh forceUpdate() se thuc hien sau lenh Global.increaseQuantity(id);
        );
    }

    decreaseQuantity(id) {
        Global.decreaseQuantity(id);
        this.setState({ refresh: !this.state.refresh },
            () => this.forceUpdate() // render lai 2 lan
        );
    }

    removeProduct(id) {
        Global.removeProduct(id);

        this.setState({ refresh: !this.state.refresh },
            () => this.forceUpdate() // render lai 2 lan
        );
    }

  
    render() {
        const { main, checkoutButton, checkoutTitle, wrapper,
            product, mainRight, productController,
            txtName, txtPrice, productImage, numberOfProduct,
            txtShowDetail, showDetailContainer } = styles;
        //const item = this.props.navigation.getParam('item', 'null');
        const arrCart = Global.productsInCart;
        const arr = arrCart.map(e => e.product.id * e.quantity); // price * quantity
        const total = arr.length !== 0 ? arr.reduce((previouValue, currentValue) => previouValue + currentValue) : 0;

        
        return (

            <View style={wrapper}>
                <Header navigation={this.props.navigation} />
                <ScrollView style={main}>
                    {
                        arrCart.map(item => (
                            <View style={product} key={item.product.id}>
                                <Image source={{ uri: item.product.download_url }} style={productImage} />
                                <View style={mainRight}>
                                    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                                        <Text style={txtName}>{item.product.author}</Text>
                                        <TouchableOpacity onPress={() => this.removeProduct(item.product.id)}>
                                            <Text style={{ color: '#969696' }}>X</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View>
                                        <Text style={txtPrice}>{item.product.id}₹</Text>
                                    </View>
                                    <View style={productController}>
                                        <View style={numberOfProduct}>
                                            <TouchableOpacity onPress={() => this.increaseQuantity(item.product.id)}>
                                                <Text>+</Text>
                                            </TouchableOpacity>
                                            <Text>{item.quantity}</Text>
                                            <TouchableOpacity onPress={() => this.decreaseQuantity(item.product.id)}>
                                                <Text>-</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity
                                            style={showDetailContainer}
                                            onPress={() => this.props.navigation.navigate('ProductDetails', { product: item.product })}
                                        >
                                            <Text style={txtShowDetail} >SHOW DETAILS</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </ScrollView>
                <TouchableOpacity style={checkoutButton} onPress={() => this.onCheckout(arrCart)}>
                    <Text style={checkoutTitle}>TOTAL {total}₹ CHECKOUT NOW</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const { width } = Dimensions.get('window');
const imageWidth = width / 4;
const imageHeight = (imageWidth * 452) / 361;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#DFDFDF'
    },
    checkoutButton: {
        height: 50,
        margin: 10,
        marginTop: 0,
        backgroundColor: '#F39C12',
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    main: {
        width, backgroundColor: '#DFDFDF'
    },
    checkoutTitle: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    product: {
        flexDirection: 'row',
        margin: 10,
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        shadowColor: '#3B5458',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2
    },
    productImage: {
        width: imageWidth,
        height: imageHeight,
        flex: 1,
        resizeMode: 'center'
    },
    mainRight: {
        flex: 3,
        justifyContent: 'space-between'
    },
    productController: {
        flexDirection: 'row'
    },
    numberOfProduct: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    txtName: {
        paddingLeft: 20,
        color: '#A7A7A7',
        fontSize: 20,
        fontWeight: '400',
    },
    txtPrice: {
        paddingLeft: 20,
        color: '#C21C70',
        fontSize: 20,
        fontWeight: '400',
    },
    txtShowDetail: {
        color: '#C21C70',
        fontSize: 10,
        fontWeight: '400',
        textAlign: 'right',
    },
    showDetailContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }
});

export default withNavigationFocus(Cart);
