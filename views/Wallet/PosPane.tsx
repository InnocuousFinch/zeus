import * as React from 'react';
import {
    Animated,
    FlatList,
    View,
    Text,
    TouchableHighlight,
    TouchableOpacity
} from 'react-native';
import BigNumber from 'bignumber.js';
import { ButtonGroup, SearchBar } from 'react-native-elements';
import { inject, observer } from 'mobx-react';

import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import WalletHeader from '../../components/WalletHeader';

import { Spacer } from '../../components/layout/Spacer';
import OrderItem from './OrderItem';

import FiatStore from '../../stores/FiatStore';
import NodeInfoStore from '../../stores/NodeInfoStore';
import PosStore from '../../stores/PosStore';
import UnitsStore, { SATS_PER_BTC } from '../../stores/UnitsStore';
import SettingsStore from '../../stores/SettingsStore';

import { themeColor } from '../../utils/ThemeUtils';
import { localeString } from '../../utils/LocaleUtils';

import { version } from './../../package.json';

interface PosPaneProps {
    navigation: any;
    FiatStore: FiatStore;
    NodeInfoStore: NodeInfoStore;
    PosStore: PosStore;
    UnitsStore: UnitsStore;
    SettingsStore: SettingsStore;
}

interface PosPaneState {
    selectedIndex: number;
    search: string;
    fadeAnimation: any;
}

@inject('FiatStore', 'NodeInfoStore', 'PosStore', 'UnitsStore', 'SettingsStore')
@observer
export default class PosPane extends React.PureComponent<
    PosPaneProps,
    PosPaneState
> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedIndex: 0,
            search: '',
            fadeAnimation: new Animated.Value(1)
        };

        Animated.loop(
            Animated.sequence([
                Animated.timing(this.state.fadeAnimation, {
                    toValue: 0,
                    duration: 500,
                    delay: 1000,
                    useNativeDriver: true
                }),
                Animated.timing(this.state.fadeAnimation, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                })
            ])
        ).start();
    }

    renderItem = (order) => {
        const { navigation, FiatStore } = this.props;
        const { getRate, getSymbol } = FiatStore;
        const { item } = order;
        const isPaid: boolean = item && item.payment;

        let tip = '';
        if (isPaid) {
            const { orderTip, rate } = item.payment;
            tip = new BigNumber(orderTip)
                .multipliedBy(rate)
                .dividedBy(SATS_PER_BTC)
                .toFixed(2);
        }

        return (
            <TouchableHighlight
                onPress={() => {
                    if (getRate() === '$N/A') return;
                    navigation.navigate('Order', {
                        order: item
                    });
                }}
            >
                <OrderItem
                    title={item.getItemsList}
                    money={
                        isPaid
                            ? `${item.getTotalMoneyDisplay} + ${
                                  getSymbol().symbol
                              }${tip}`
                            : item.getTotalMoneyDisplay
                    }
                    date={item.getDisplayTime}
                />
            </TouchableHighlight>
        );
    };

    render() {
        const {
            SettingsStore,
            PosStore,
            FiatStore,
            NodeInfoStore,
            navigation
        } = this.props;
        const { search, selectedIndex } = this.state;
        const {
            loading,
            getOrders,
            filteredOpenOrders,
            filteredPaidOrders,
            updateSearch
        } = PosStore;
        const { getRate, getFiatRates } = FiatStore;
        const orders =
            selectedIndex === 0 ? filteredOpenOrders : filteredPaidOrders;

        const headerString = `${localeString('general.orders')} (${
            orders.length || 0
        })`;

        const error = NodeInfoStore.error || SettingsStore.error;

        const openOrdersButton = () => (
            <Text
                style={{
                    fontFamily: 'Lato-Regular',
                    color:
                        selectedIndex === 0
                            ? themeColor('background')
                            : themeColor('text')
                }}
            >
                {localeString('general.open')}
            </Text>
        );

        const paidOrdersButton = () => (
            <Text
                style={{
                    fontFamily: 'Lato-Regular',
                    color:
                        selectedIndex === 1
                            ? themeColor('background')
                            : themeColor('text')
                }}
            >
                {localeString('views.Wallet.Invoices.paid')}
            </Text>
        );

        const buttons = [
            { element: openOrdersButton },
            { element: paidOrdersButton }
        ];

        if (error) {
            return (
                <View
                    style={{
                        backgroundColor: themeColor('error'),
                        paddingTop: 20,
                        paddingLeft: 10,
                        flex: 1
                    }}
                >
                    <Text
                        style={{
                            fontFamily: 'Lato-Regular',
                            color: '#fff',
                            fontSize: 20,
                            marginTop: 20,
                            marginBottom: 25
                        }}
                    >
                        {SettingsStore.errorMsg
                            ? SettingsStore.errorMsg
                            : NodeInfoStore.errorMsg
                            ? NodeInfoStore.errorMsg
                            : localeString('views.Wallet.MainPane.error')}
                    </Text>
                    <Button
                        icon={{
                            name: 'settings',
                            size: 25,
                            color: '#fff'
                        }}
                        title={localeString(
                            'views.Wallet.MainPane.goToSettings'
                        )}
                        buttonStyle={{
                            backgroundColor: 'gray',
                            borderRadius: 30
                        }}
                        containerStyle={{
                            alignItems: 'center'
                        }}
                        onPress={() => {
                            const { posStatus, settings } =
                                this.props.SettingsStore;
                            const loginRequired =
                                settings &&
                                (settings.passphrase || settings.pin);
                            const posEnabled = posStatus === 'active';

                            if (posEnabled && loginRequired) {
                                navigation.navigate('Lockscreen', {
                                    attemptAdminLogin: true
                                });
                            } else {
                                navigation.navigate('Settings');
                            }
                        }}
                        adaptiveWidth
                    />
                    <Text
                        style={{
                            fontFamily: 'Lato-Regular',
                            color: '#fff',
                            fontSize: 12,
                            marginTop: 20,
                            marginBottom: -40
                        }}
                    >
                        {`v${version}`}
                    </Text>
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                <WalletHeader
                    title={headerString}
                    navigation={navigation}
                    SettingsStore={SettingsStore}
                />

                {getRate() === '$N/A' ? (
                    <Animated.View
                        style={{
                            alignSelf: 'center',
                            opacity: this.state.fadeAnimation
                        }}
                    >
                        <Text
                            style={{
                                color: themeColor('text'),
                                marginBottom: 10
                            }}
                        >
                            {localeString(
                                'pos.views.Wallet.PosPane.fetchingRates'
                            )}
                        </Text>
                    </Animated.View>
                ) : (
                    <TouchableOpacity onPress={() => getFiatRates()}>
                        <Text
                            style={{
                                color:
                                    getRate() === '$N/A'
                                        ? themeColor('error')
                                        : themeColor('text'),
                                alignSelf: 'center',
                                marginBottom: 10
                            }}
                        >
                            {getRate() === '$N/A'
                                ? localeString('general.fiatFetchError')
                                : getRate()}
                        </Text>
                    </TouchableOpacity>
                )}

                {!loading && (
                    <ButtonGroup
                        onPress={(selectedIndex: number) => {
                            this.setState({ selectedIndex });
                        }}
                        selectedIndex={selectedIndex}
                        buttons={buttons}
                        selectedButtonStyle={{
                            backgroundColor: themeColor('highlight'),
                            borderRadius: 12
                        }}
                        containerStyle={{
                            backgroundColor: themeColor('secondary'),
                            borderRadius: 12,
                            borderColor: themeColor('secondary')
                        }}
                        innerBorderStyle={{
                            color: themeColor('secondary')
                        }}
                    />
                )}

                {loading && <LoadingIndicator />}

                {!loading && (
                    <SearchBar
                        placeholder={localeString('general.search')}
                        onChangeText={(value: string) => {
                            updateSearch(value);
                            this.setState({
                                search: value
                            });
                        }}
                        value={search}
                        inputStyle={{
                            color: themeColor('text')
                        }}
                        placeholderTextColor={themeColor('secondaryText')}
                        containerStyle={{
                            backgroundColor: themeColor('background'),
                            borderTopWidth: 0,
                            borderBottomWidth: 0
                        }}
                        inputContainerStyle={{
                            borderRadius: 15,
                            backgroundColor: themeColor('secondary')
                        }}
                    />
                )}

                {!loading && orders && orders.length > 0 && (
                    <FlatList
                        data={orders}
                        renderItem={this.renderItem}
                        ListFooterComponent={<Spacer height={100} />}
                        onRefresh={() => getOrders()}
                        refreshing={loading}
                        keyExtractor={(item, index) => `${index}`}
                    />
                )}

                {!loading && orders && orders.length === 0 && (
                    <TouchableOpacity onPress={() => getOrders()}>
                        <Text
                            style={{
                                color: themeColor('text'),
                                margin: 10,
                                textAlign: 'center'
                            }}
                        >
                            {selectedIndex === 0
                                ? localeString(
                                      'pos.views.Wallet.PosPane.noOrders'
                                  )
                                : localeString(
                                      'pos.views.Wallet.PosPane.noOrdersPaid'
                                  )}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }
}
