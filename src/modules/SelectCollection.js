import BaseComponent from "@/modules/generic/BaseComponent";
import MatchMedia from "@/constants/MatchMedia";
import button from "@/components/Button";

const rootSelector = '[data-js-select]';

class Select extends BaseComponent {
    selectors = {
        root: rootSelector,
        originalControl: '[data-js-select-original-control]',
        button: '[data-js-select-button]',
        dropdown: '[data-js-select-dropdown]',
        option: '[data-js-select-option]',
    }

    stateClasses = {
        isSelected: 'is-selected',
        isExpanded: 'is-expanded',
        isCurrent: 'is-current',
        isOnTheLeftSide: 'is-on-the-left-side',
        isOnTheRightSide: 'is-on-the-right-side',
    }

    initialState = {
        isExpanded: false,
        selectedOptionElement: null,
        currentOptionIndex: null,
    }

    constructor(rootElement) {
        super();
        this.rootElement = rootElement;
        this.originalControlElement = this.rootElement.querySelector(this.selectors.originalControl);
        this.buttonElement = this.rootElement.querySelector(this.selectors.button);
        this.dropdownElement = this.rootElement.querySelector(this.selectors.dropdown);
        this.optionElements = this.dropdownElement.querySelectorAll(this.selectors.option);
        this.state = this.getProxyState({
            ...this.initialState,
            currentOptionIndex: this.originalControlElement.selectedIndex,
            selectedOptionElement: this.optionElements[this.originalControlElement.selectedIndex],
        })
        setTimeout( this.fixDropdownPosition, 500)
        this.updateTabIndexes();
        this.bindEvents();
    }

    updateUI() {
        const {
            isExpanded,
            selectedOptionElement,
            currentOptionIndex,
        } = this.state;

        const newSelectedOptionValue = selectedOptionElement.textContent.trim();

        const updateOriginalControl = () => {
            this.originalControlElement.value = newSelectedOptionValue;
        };
        const updateButton = () => {
            this.buttonElement.textContent = newSelectedOptionValue;
            this.buttonElement.classList.toggle(this.stateClasses.isExpanded, isExpanded);
            this.buttonElement.ariaExpanded = isExpanded;
            this.buttonElement.ariaActiveDescendant = this.optionElements[currentOptionIndex].id;
        };
        const updateDropdown = () => {
            this.dropdownElement.classList.toggle(this.stateClasses.isExpanded, isExpanded);
        };
        const updateOptions = () => {
            this.optionElements.forEach((option, index) => {
                const isCurrent = currentOptionIndex === index;
                const isSelected = selectedOptionElement === option;

                option.classList.toggle(this.stateClasses.isCurrent, isCurrent);
                option.classList.toggle(this.stateClasses.isSelected, isSelected);
                option.ariaSelected = isSelected;
            })
        };

        updateOriginalControl();
        updateButton();
        updateDropdown();
        updateOptions();
    }

    fixDropdownPosition = () => {
        const viewportWidth = document.documentElement.clientWidth;
        const viewportCenterX = viewportWidth / 2;
        const { width, x } = this.buttonElement.getBoundingClientRect();
        const buttonCenterX = x + width / 2;
        const isButtonOnTheLeftViewportSide = buttonCenterX < viewportCenterX;

        this.dropdownElement.classList.toggle(this.stateClasses.isOnTheLeftSide, isButtonOnTheLeftViewportSide);
        this.dropdownElement.classList.toggle(this.stateClasses.isOnTheRightSide, !isButtonOnTheLeftViewportSide);

    }

    updateTabIndexes(
        isMobileDevise = MatchMedia.mobile.matches
    ) {
         this.originalControlElement.tabIndex = isMobileDevise ? 0 : -1;
         this.buttonElement.tabIndex = isMobileDevise ? -1 : 0;
    }

    toggleExpandedState() {
        this.state.isExpanded = !this.state.isExpanded;
    }

    expand() {
        this.state.isExpanded = true;
    }

    collapse() {
        this.state.isExpanded = false;
    }

    get isNeedToExpand() {
        const isButtonFocused = document.activeElement === this.buttonElement;

        return (!this.state.isExpanded && isButtonFocused);
    }

    selectCurrentOption () {
        this.state.selectedOptionElement = this.optionElements[this.state.currentOptionIndex];
    }

    onMobilelMatchMediaChange = (event) => {
        this.updateTabIndexes(event.matches)
    }

    onOriginalControlChange = () => {
        this.state.selectedOptionElement = this.optionElements[this.originalControlElement.selectedIndex];
    }

    onButtonClick = () => {
        this.toggleExpandedState();
    }

    onClick = (event) => {
        const { target } = event;
        const isButtonClick = target === this.buttonElement;
        const isOutsideDropdownClick = target.closest(this.selectors.dropdown) !== this.dropdownElement;

        if( !isButtonClick && isOutsideDropdownClick ) {
            this.collapse();
            return;
        }

        const isOptionClick = target.matches(this.selectors.option);

        if( isOptionClick ) {
            this.state.selectedOptionElement = target;
            this.state.currentOptionIndex = [...this.optionElements].findIndex((optionElement) => optionElement === target);
            this.collapse();
        }
    }

    onArrowUpKeyDown = () => {
        if (this.isNeedToExpand) {
            this.expand()
            return
        }

        if(this.state.currentOptionIndex > 0) {
            this.state.currentOptionIndex--
        }
    }

    onArrowDownKeyDown = () => {
        if (this.isNeedToExpand) {
            this.expand()
            return
        }

        if(this.state.currentOptionIndex < this.optionElements.length - 1) {
            this.state.currentOptionIndex++
        }
    }

    onSpaceKeyDown = () => {
        if (this.isNeedToExpand) {
            this.expand()
            return
        }

        this.selectCurrentOption();
        this.collapse();
    }

    onEnterKeyDown = () => {
        if (this.isNeedToExpand) {
            this.expand()
            return
        }

        this.selectCurrentOption();
        this.collapse();
    }

    onEscKeyDown = () => {
        this.collapse();
    }

    onKeyDown = (event) => {
        const { code } = event;

        const action = {
            ArrowUp: this.onArrowUpKeyDown,
            ArrowDown: this.onArrowDownKeyDown,
            Space: this.onSpaceKeyDown,
            Enter: this.onEnterKeyDown,
            Esc: this.onEscKeyDown,
        }[code];

        if (action) {
            event.preventDefault();
            action()
        }
    }

    bindEvents() {
        MatchMedia.mobile.addEventListener('change', this.onMobilelMatchMediaChange);
        this.originalControlElement.addEventListener('change', this.onOriginalControlChange);
        this.buttonElement.addEventListener('click', this.onButtonClick);
        document.addEventListener('click', this.onClick);
        this.rootElement.addEventListener('keydown', this.onKeyDown);
    }
}

class SelectCollection {
    constructor () {
        this.init();
    }

    init() {
        document.querySelectorAll(rootSelector).forEach((element) => {
            new Select(element)
        })
    }
}


export default SelectCollection;
