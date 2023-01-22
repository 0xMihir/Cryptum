<script lang="ts">
    import { createEventDispatcher } from "svelte";

    interface Option {
        name: string,
        // this should be unique
        value: any,
        // there should only be 1 default element
        // subsequent default elements will be ignored
        // the default element is only considered on component initilization
        default?: boolean,
    }

    let rootElem: HTMLDivElement;
    let inputElem: HTMLInputElement;
    const eventDispatcher = createEventDispatcher();

    export let options: Option[];
    export let clearButtonLable: string = "Clear Selection";
    export let id: string | undefined = undefined;
    // the maximum height of the dropdown in rem
    // after it reaches the max height, it will start to scroll
    export let maxDropdownHeight: number = 15;

    let defaultElement: Option | null = null;
    for (let i = 0; i < options.length; i ++) {
        if (options[i].default === true) {
            defaultElement = options[i];
            break;
        }
    }

    // do assignmants for default value sepearately to override bound values
    export let selectedName: string | null = null;
    selectedName = defaultElement?.name ?? null;

    export let value: any = null;
    value = defaultElement?.value ?? null;

    // TODO: support setting value by just changing the value variable
    export const setValue = (value: any) => {
        for (const option of options) {
            if (option.value === value) {
                setSelectedOption(option);
                searchValue = option.name;
                return;
            }
        }
        setSelectedOption(null);
        searchValue = "";
    }

    function setSelectedOption(newOption: Option | null) {
        const oldValue = value;

        selectedName = newOption?.name ?? null;
        value = newOption?.value ?? null;

        if (oldValue !== value) {
            eventDispatcher("change");
        }
    }

    let isOpen = false;

    function filterSearchResults(options: Option[], searchValue: string): Option[] {
        if (searchValue === "") {
            return options;
        }

        const lowerCaseSearchValue = searchValue.toLowerCase();

        // TODO: we could be smarter and make this faster
        return options.filter(elem => {
            return elem.name.toLowerCase().indexOf(lowerCaseSearchValue) !== -1;
        });
    }

    // the value currently in the search box
    let searchValue = defaultElement?.name ?? "";

    $: searchResults = filterSearchResults(options, searchValue);
</script>

<div class="dropdown" bind:this={rootElem}>
    <input
        class="form-control"
        type="text"
        on:focus={() => {
            // when the user first clicks on the input box, we want to show all options,
            // even if there is a currently selected option, and then we start filtering once they start typing
            searchResults = options;
            isOpen = true;
        }}
        on:blur={() => {
            // when the button is clicked, this input looses focus before the button click event is fired
            // this could cause the button to disapear before it can be clicked when we close the dropdown
            // this is the reason for this check which looks if any children of the root element are selected,
            // and only closes if none of them are
            if (!rootElem.matches(":focus-within")) {
                isOpen = false;

                if (selectedName == null) {
                    searchValue = "";
                } else {
                    searchValue = selectedName;
                }
            }
        }}
        on:keydown={event => {
            if (event.key === "Escape") {
                inputElem.blur();
            }
        }}
        bind:value={searchValue}
        bind:this={inputElem}
        id={id}
    />
    <div class="search-select-menu dropdown-menu" class:show={isOpen} style:max-height={`${maxDropdownHeight}rem`}>
        <button
            class="dropdown-item"
            on:click={() => {
                isOpen = false;
                searchValue = "";
                setSelectedOption(null);
            }}
        >{clearButtonLable}</button>
        {#if searchResults.length !== 0}
            <div class="dropdown-divider"/>
        {/if}
        {#each searchResults as result (result.value)}
            <button
                class="dropdown-item"
                on:click={() => {
                    isOpen = false;
                    searchValue = result.name;
                    setSelectedOption(result);
                }}
            >{result.name}</button>
        {/each}
    </div>
</div>

<style>
    .search-select-menu {
        /* These are the same props as the sveltestrap dropdown menu */
        position: absolute;
        inset: 0px auto auto 0px;
        margin: 0px;
        transform: translate(0px, 40px);

        /* These are additional options for max height and scrolling */
        overflow-y: scroll;
    }
</style>