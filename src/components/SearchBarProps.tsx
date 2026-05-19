export interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
    initialValue?: string;
    placeholder?: string;
}
