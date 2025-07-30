import { useEffect, useState, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Paginator } from "primereact/paginator";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: Artwork }>(
    {}
  );
  const [selectInputVisible, setSelectInputVisible] = useState(false);
  const [selectCount, setSelectCount] = useState("");
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);

  const fetchArtworks = useCallback(async (page: number) => {
    const res = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${page + 1}`
    );
    const data = await res.json();
    setArtworks(data.data);
    setTotalRecords(data.pagination.total);
  }, []);

  const fetchAllArtworks = useCallback(async () => {
    const collected: Artwork[] = [];
    let page = 1;
    const limit = 100;
    while (collected.length < limit) {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      const data = await res.json();
      if (!data.data.length) break;
      collected.push(...data.data);
      page++;
    }
    setAllArtworks(collected);
  }, []);

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage, fetchArtworks]);

  const onPageChange = (e: any) => {
    setCurrentPage(e.page);
  };

  const onRowSelectChange = (row: Artwork, checked: boolean) => {
    const updated = { ...selectedRows };
    if (checked) {
      updated[row.id] = row;
    } else {
      delete updated[row.id];
    }
    setSelectedRows(updated);
  };

  const toggleSelectInput = () => {
    setSelectInputVisible((prev) => !prev);
    if (!allArtworks.length) fetchAllArtworks();
  };

  const handleSelectSubmit = () => {
    const count = parseInt(selectCount);
    if (!isNaN(count) && allArtworks.length) {
      const selected = { ...selectedRows };
      allArtworks.slice(0, count).forEach((art) => {
        selected[art.id] = art;
      });
      setSelectedRows(selected);
    }
    setSelectInputVisible(false);
    setSelectCount("");
  };

  const headerTemplate = (
    <div className="header-wrapper">
      <Checkbox
        inputId="selectAll"
        onChange={(e) => {
          const all = { ...selectedRows };
          artworks.forEach((art) => {
            if (e.checked) all[art.id] = art;
            else delete all[art.id];
          });
          setSelectedRows(all);
        }}
        checked={
          artworks.length > 0 && artworks.every((art) => selectedRows[art.id])
        }
      />
      <i
        className="pi pi-chevron-down down-icon"
        onClick={toggleSelectInput}
        style={{ cursor: "pointer", marginLeft: "3vmin" }}
      />
      {selectInputVisible && (
        <div className="select-popup">
          <input
            type="number"
            placeholder="Select rows..."
            value={selectCount}
            onChange={(e) => setSelectCount(e.target.value)}
          />
          <button onClick={handleSelectSubmit}>submit</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      <h1>Artworks</h1>
      <DataTable
        value={artworks}
        dataKey="id"
        paginator={false}
        responsiveLayout="scroll"
        rowClassName={(rowData) =>
          selectedRows[rowData.id] ? "selected-row" : ""
        }
      >
        <Column
          header={headerTemplate}
          body={(row) => (
            <Checkbox
              inputId={`cb-${row.id}`}
              value={row.id}
              onChange={(e) => onRowSelectChange(row, !!e.checked)}
              checked={!!selectedRows[row.id]}
              className="custom-checkbox"
            />
          )}
          style={{ width: "80px" }}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
      <Paginator
        first={currentPage * 10}
        rows={10}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default App;
