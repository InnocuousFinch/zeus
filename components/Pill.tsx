import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { themeColor } from './../utils/ThemeUtils';

interface PillProps {
    title: string;
    textColor?: string;
    borderColor?: string;
    backgroundColor?: string;
}

interface PillState {
    selected: boolean;
}

export default class Pill extends React.Component<PillProps, PillState> {
    state = {
        selected: false
    };

    select = () => {
        this.setState({
            selected: true
        });
    };

    render() {
        const { selected } = this.state;
        const { title, textColor, borderColor, backgroundColor } = this.props;

        return (
            <TouchableOpacity
                style={{
                    borderWidth: 3,
                    borderColor: borderColor || themeColor('highlight'),
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 90,
                    height: 40,
                    backgroundColor:
                        backgroundColor || themeColor('background'),
                    borderRadius: 50
                }}
            >
                <Text style={{ color: textColor || themeColor('highlight') }}>
                    {title}
                </Text>
            </TouchableOpacity>
        );
    }
}
