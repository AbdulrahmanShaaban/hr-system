import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TablePagination, type PageMeta } from "@/components/table-pagination";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function defaultMeta(overrides?: Partial<PageMeta>): PageMeta {
  return {
    page: 1,
    limit: 10,
    itemCount: 50,
    pageCount: 5,
    hasPreviousPage: false,
    hasNextPage: true,
    ...overrides,
  };
}

describe("TablePagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page buttons for small page counts", () => {
    const meta = defaultMeta({ pageCount: 3 });
    render(
      <TablePagination
        meta={meta}
        page={1}
        limit={10}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("renders showing text with item count", () => {
    const meta = defaultMeta({ itemCount: 50 });
    render(
      <TablePagination
        meta={meta}
        page={1}
        limit={10}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    expect(screen.getByText(/عرض 10 من أصل 50/)).toBeDefined();
  });

  it("disables previous button on first page", () => {
    const meta = defaultMeta({ hasPreviousPage: false });
    render(
      <TablePagination
        meta={meta}
        page={1}
        limit={10}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    const prevButton = screen.getByText("السابق");
    expect(prevButton).toBeDefined();
    expect((prevButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("enables previous button when not on first page", () => {
    const meta = defaultMeta({ page: 3, hasPreviousPage: true });
    render(
      <TablePagination
        meta={meta}
        page={3}
        limit={10}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    const prevButton = screen.getByText("السابق");
    expect((prevButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("disables next button on last page", () => {
    const meta = defaultMeta({ hasNextPage: false });
    render(
      <TablePagination
        meta={meta}
        page={5}
        limit={10}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    const nextButton = screen.getByText("التالي");
    expect((nextButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("enables next button when not on last page", () => {
    const meta = defaultMeta({ hasNextPage: true });
    render(
      <TablePagination
        meta={meta}
        page={2}
        limit={10}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    const nextButton = screen.getByText("التالي");
    expect((nextButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("calls onPageChange when page button is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const meta = defaultMeta({ pageCount: 3 });

    render(
      <TablePagination
        meta={meta}
        page={1}
        limit={10}
        onPageChange={onPageChange}
        onLimitChange={vi.fn()}
      />
    );

    await user.click(screen.getByText("2"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange when previous button is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const meta = defaultMeta({ page: 3, hasPreviousPage: true });

    render(
      <TablePagination
        meta={meta}
        page={3}
        limit={10}
        onPageChange={onPageChange}
        onLimitChange={vi.fn()}
      />
    );

    await user.click(screen.getByText("السابق"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders null when no items", () => {
    const meta = defaultMeta({ pageCount: 0, itemCount: 0 });
    const { container } = render(
      <TablePagination
        meta={meta}
        page={1}
        limit={10}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    expect(container.innerHTML).toBe("");
  });

  it("disables all buttons when disabled prop is true", () => {
    const meta = defaultMeta();
    render(
      <TablePagination
        meta={meta}
        page={1}
        limit={10}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        disabled
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it("renders custom showingLabel", () => {
    const meta = defaultMeta({ itemCount: 25 });
    const showingLabel = (shown: number, total: number) =>
      `Showing ${shown} of ${total} records`;

    render(
      <TablePagination
        meta={meta}
        page={1}
        limit={10}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        showingLabel={showingLabel}
      />
    );

    expect(screen.getByText("Showing 10 of 25 records")).toBeDefined();
  });
});
