import getParams from "@/utils/getParams";
import pxToRem from "@/utils/pxToRem";
import BaseComponent from "@/modules/generic/BaseComponent";

const rootSelector = '[data-js-tabs]';

class Tabs extends BaseComponent {
    selectors = {
        root: rootSelector,
        navigation: '[data-js-tabs-navigation]',
        button: '[data-js-tabs-navigation-button]',
        content: '[data-js-tabs-content]',
    }

    stateClasses = {
        isActive: 'is-active',
    }

    stateCSSVariables = {
        activeButtonWidth: '--tabsNavigationActiveButtonWidth',
        activeButtonOffsetLeft: '--tabsNavigationActiveButtonOffsetLeft',
    }

    constructor(rootElement) {
        super();
        this.rootElement = rootElement;
        this.params = getParams(this.rootElement, this.selectors.root);
        this.navigationElement = this.params.navigationTargetElementId
            ? document.getElementById(this.params.navigationTargetElementId)
            : this.rootElement.querySelector(this.selectors.navigation);
        this.buttonElements = [...this.navigationElement.querySelectorAll(this.selectors.button)];
        this.contentElements = [...this.rootElement.querySelectorAll(this.selectors.content)];
        this.state = this.getProxyState({
            activeTabIndex: this.buttonElements.findIndex(({ariaSelected}) => ariaSelected),
        })
        this.limitTabsIndex = this.buttonElements.length - 1;
        this.bindEvents();
        setTimeout(
        this.bindObservers,
            500
        )

    }

    updateUI() {
        const {activeTabIndex} = this.state;

        this.buttonElements.forEach((button, index) => {
            const isActive = activeTabIndex === index;

            button.classList.toggle(
                this.stateClasses.isActive,
                isActive
            )
            button.ariaSelected = isActive;
            button.tabIndex = isActive ? 0 : -1;

            if (isActive) {
                this.updateNavigationCSSVars(button);
            }
        })

        this.contentElements.forEach((content, index) => {
            const isActive = activeTabIndex === index;

            content.classList.toggle(
                this.stateClasses.isActive,
                isActive
            )
        })
    }

    updateNavigationCSSVars(
        activeButtonElement = this.buttonElements[this.state.activeTabIndex]
    ) {
        const { width, left } = activeButtonElement.getBoundingClientRect()
        const offsetLeft= left - this.navigationElement.getBoundingClientRect().left;

        this.navigationElement.style.setProperty(
            this.stateCSSVariables.activeButtonWidth,
            `${pxToRem(width)}rem`
        )

        this.navigationElement.style.setProperty(
            this.stateCSSVariables.activeButtonOffsetLeft,
            `${pxToRem(offsetLeft)}rem`
        )
    }

    activateTab = (newTabIndex) => {
        this.state.activeTabIndex = newTabIndex;
        this.buttonElements[newTabIndex].focus();
    }

    previousTab = () => {
        const newTabIndex = this.state.activeTabIndex === 0
            ? this.limitTabsIndex
            : this.state.activeTabIndex - 1;
        console.log(this.state.activeTabIndex - 1)
        this.activateTab(newTabIndex);
    }

    nextTab = () => {
        const newTabIndex = this.state.activeTabIndex === this.limitTabsIndex
            ? 0
            : this.state.activeTabIndex + 1;

        this.activateTab(newTabIndex);
    }

    firstTab = () => {
        this.activateTab(0);
    }

    lastTab = () => {
        this.activateTab(this.limitTabsIndex);
    }

    onButtonClick(buttonIndex) {
        this.state.activeTabIndex = buttonIndex;
    }

    onKeyDown = (event) => {
        const { target, code, metaKey } = event;
        const isTabsContentFocused = this.contentElements
            .some((contentElement) => contentElement === target);
        const isTabsButtonFocused = this.buttonElements
            .some((buttonElements) => buttonElements === target);

        if ( !isTabsContentFocused  && !isTabsButtonFocused ) {
            return false;
        }

        const action = {
            ArrowLeft: this.previousTab,
            ArrowRight: this.nextTab,
            Home: this.firstTab,
            End: this.lastTab,
        }[code]

        const isMacHomeKey = metaKey && code === 'ArrowLeft';
        if (isMacHomeKey) {
            event.preventDefault();
            this.firstTab();
            return;
        }

        const isMacEndKey = metaKey && code === 'Right';
        if (isMacEndKey) {
            event.preventDefault();
            this.lastTab();
            return;
        }

        if (action) {
            event.preventDefault();
            action();
        }
    }

    bindEvents() {
        this.buttonElements.forEach((button, index) => {
            button.addEventListener('click', () => this.onButtonClick(index));
        })
        document.addEventListener('keydown', this.onKeyDown)
    }

    onResize = () => {
        this.updateNavigationCSSVars()
    }

    bindObservers = () => {
        const resizeObserver = new ResizeObserver(this.onResize);

        resizeObserver.observe(this.navigationElement)
    }
}

class TabsCollection {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll(rootSelector).forEach((el) => {
            new Tabs(el);
        })
    }
}

export default TabsCollection;