import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorAlert, WarningAlert } from "@/utils/alert";

export default function DataTable({
    title,
    fetcher,
    columns,
    searchPlaceholder = "Cari...",
    actionLabel,
    onAction,
}) {
    const [rows, setRows] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const debounce = setTimeout(() => {
            setLoading(true);

            fetcher({
                page,
                search: search || undefined,
            })
                .then((res) => {
                    setRows(res.data);
                    setPagination(res.pagination);
                    setError(null);
                })
                .catch((err) => {
                    setError(
                        err?.message || "Gagal memuat data"
                    );
                })
                .finally(() => setLoading(false));
        }, 400);

        return () => clearTimeout(debounce);
    }, [fetcher, page, search, reloadKey]);

    const currentPage = pagination?.current_page ?? page;
    const lastPage = pagination?.last_page ?? 1;
    const refresh = () => setReloadKey((k) => k + 1);

    return (
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {title && (
                            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                {title}
                            </h2>
                        )}

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Kelola dan pantau data
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Input
                            value={search}
                            onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                            }}
                            placeholder={searchPlaceholder}
                            className="
                                h-10
                                w-full
                                border-slate-200
                                bg-white
                                shadow-sm
                                focus-visible:border-[#7a1329]
                                focus-visible:ring-[#7a1329]
                                dark:border-slate-700
                                dark:bg-slate-800
                                dark:text-slate-100
                                dark:placeholder:text-slate-500
                                sm:w-64
                            "
                        />

                        {actionLabel && (
                            <Button
                                onClick={onAction}
                                className="
                                    h-10
                                    whitespace-nowrap
                                    bg-[#7a1329]
                                    px-5
                                    font-medium
                                    text-white
                                    shadow-sm
                                    transition-all
                                    hover:bg-[#631021]
                                    hover:shadow-md
                                    active:scale-[0.98]
                                    dark:bg-[#7a1329]
                                    dark:hover:bg-[#631021]
                                "
                            >
                                {actionLabel}
                            </Button>
                        )}

                    </div>

                </div>

            </CardHeader>
            <CardContent className="p-0">

                {error ? (

                    <div className="p-6">
                        <ErrorAlert message={error} />
                    </div>

                ) : !loading && rows.length === 0 ? (

                    <div className="p-6">
                        <WarningAlert message="Data tidak ditemukan" />
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900/60">

                                    {columns.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            className="
                                                h-12
                                                whitespace-nowrap
                                                px-6
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-slate-500
                                                dark:text-slate-400
                                            "
                                        >
                                            {column.label}
                                        </TableHead>
                                    ))}

                                </TableRow>
                            </TableHeader>
                            <TableBody>

                                {loading ? (

                                    Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <TableRow key={index}>

                                                {columns.map(
                                                    (column) => (
                                                        <TableCell
                                                            key={column.key}
                                                            className="px-6 py-4"
                                                        >
                                                            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                                        </TableCell>
                                                    )
                                                )}

                                            </TableRow>
                                        )
                                    )

                                ) : (

                                    rows.map((row, index) => (
                                        <TableRow
                                            key={row.id}
                                            className="
                                                border-b
                                                border-slate-100
                                                transition-colors
                                                hover:bg-rose-50/50
                                                dark:border-slate-800
                                                dark:hover:bg-[#7a1329]/10
                                            "
                                        >

                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.key}
                                                    className="
                                                        px-6
                                                        py-4
                                                        text-sm
                                                        text-slate-700
                                                        dark:text-slate-300
                                                    "
                                                >
                                                    {column.render
                                                        ? column.render(row, index, { refresh })
                                                        : row[column.key] ?? "-"}
                                                </TableCell>
                                            ))}

                                        </TableRow>
                                    ))

                                )}

                            </TableBody>

                        </Table>

                    </div>

                )}

                {pagination && (

                    <div className="
                        flex
                        flex-col
                        gap-4
                        border-t
                        border-slate-200
                        px-6
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        dark:border-slate-800
                    ">

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Halaman{" "}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {currentPage}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {lastPage}
                            </span>

                            {pagination.total !== undefined && (
                                <>
                                    {" "}·{" "}
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {pagination.total}
                                    </span>{" "}
                                    data
                                </>
                            )}
                        </p>

                        <div className="flex items-center gap-2">

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1 || loading}
                                onClick={() =>
                                    setPage((p) => p - 1)
                                }
                                className="
                                    border-slate-200
                                    bg-white
                                    text-slate-600
                                    hover:border-[#7a1329]/40
                                    hover:bg-[#7a1329]/5
                                    hover:text-[#7a1329]
                                    dark:border-slate-700
                                    dark:bg-slate-800
                                    dark:text-slate-300
                                    dark:hover:bg-[#7a1329]/10
                                    dark:hover:text-[#c25a70]
                                "
                            >
                                Sebelumnya
                            </Button>

                            <div className="
                                flex
                                h-9
                                min-w-9
                                items-center
                                justify-center
                                rounded-md
                                bg-[#7a1329]
                                px-3
                                text-sm
                                font-medium
                                text-white
                            ">
                                {currentPage}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    loading ||
                                    currentPage >= lastPage
                                }
                                onClick={() =>
                                    setPage((p) => p + 1)
                                }
                                className="
                                    border-slate-200
                                    bg-white
                                    text-slate-600
                                    hover:border-[#7a1329]/40
                                    hover:bg-[#7a1329]/5
                                    hover:text-[#7a1329]
                                    dark:border-slate-700
                                    dark:bg-slate-800
                                    dark:text-slate-300
                                    dark:hover:bg-[#7a1329]/10
                                    dark:hover:text-[#c25a70]
                                "
                            >
                                Berikutnya
                            </Button>

                        </div>

                    </div>

                )}

            </CardContent>

        </Card>
    );
}