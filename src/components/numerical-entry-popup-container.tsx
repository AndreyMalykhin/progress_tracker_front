import NumericalEntryPopup from "components/numerical-entry-popup";
import { debounce } from "lodash";
import * as React from "react";

interface INumericalEntryPopupContainerProps {
    onClose: (entry?: number) => void;
}

interface INumericalEntryPopupContainerState {
    entry?: string;
    entryError?: string|null;
}

class NumericalEntryPopupContainer extends
    React.Component<INumericalEntryPopupContainerProps, INumericalEntryPopupContainerState> {
    public state: INumericalEntryPopupContainerState = {};

    public constructor(
        props: INumericalEntryPopupContainerProps, context: any,
    ) {
        super(props, context);
        this.validateEntry = debounce(this.validateEntry, 512);
    }

    public render() {
        const { entry, entryError } = this.state;
        const isValid = entryError === null;
        return (
            <NumericalEntryPopup
                isValid={isValid}
                entry={entry}
                entryError={entryError}
                onCancel={this.onCancel}
                onSubmit={this.onSubmit}
                onChangeEntry={this.onChangeEntry}
            />
        );
    }

    private onChangeEntry = (entry: string) => {
        this.setState({ entry });
        this.validateEntry();
    }

    private validateEntry = () => {
        this.setState((prevState) => {
            const entry = parseFloat(prevState.entry!);
            const entryError = isNaN(entry!) || entry === 0 ?
                "errors.zeroNumber" : null;
            return { entryError };
        });
    }

    private onCancel = () => this.props.onClose();

    private onSubmit = () => {
        this.props.onClose(Number(this.state.entry));
    }
}

export { INumericalEntryPopupContainerProps };
export default NumericalEntryPopupContainer;
