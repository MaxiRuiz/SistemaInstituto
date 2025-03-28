import React,  { useState, useEffect }  from 'react'
import classNames from 'classnames'

import { CButton, CCard, CCardBody, CCardFooter, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormSelect, CFormInput, CInputGroup,  CInputGroupText, CContainer, CModalFooter, CPagination, CPaginationItem, CTableFoot} from '@coreui/react'

import { cilTrash, cilPencil, cilArrowTop, cilArrowBottom, cilSwapVertical} from '@coreui/icons'

import { CIcon } from '@coreui/icons-react';

import FormAltaUsuario from '../../components/FormAltaUsuario'; // Importa el componente TextInput FormAltaUsuario.js
import { CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'

import { CSVLink } from "react-csv";

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { saveAs } from 'file-saver'; // Para descargar el archivo
import { PDFViewer } from '@react-pdf/renderer';

import ReactDOM from 'react-dom';

import { compactStyles,detailedStyles } from '../dashboard/pdfFormats/pdfStyles';

import '../../css/PersonalStyles.css'   /* Oculta todo excepto la tabla */


import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'




const columnHelper = createColumnHelper();

const columns = [
  
  columnHelper.accessor('name', {     
        header: 'Nombre',
        cell: info => info.getValue(),  // Cómo se muestra el valor en la celda
        enableSorting: true,
        filterFn: 'includesString',
      }
  ),

  columnHelper.accessor('email', {
    header: () => 'Mail',
    cell: info => info.getValue(),
    enableSorting: true,
    filterFn: 'includesString',
  }),

  columnHelper.accessor('domicilio', {
    header: () => 'Domicilio',
    cell: info => info.getValue(),
    enableSorting: true,
    filterFn: 'includesString',
  }),

  columnHelper.accessor('telefono', {
    header: () => 'Teléfono',
    cell: info => info.getValue(),
    enableSorting: true,
    filterFn: 'includesString',
  }),

  columnHelper.display({
    id: 'actions',
    header: () => {
      return (
        <div className="d-flex justify-content-center gap-3">
          <span>Acción</span>
        </div>
      )
    },
    cell: ({ row }) => {
      console.log('Datos de la fila:', row.original);
      return (
        <div style={{ display: 'flex', gap: '10px' }}>
        <a
          href="#editEmployeeModal"
          className="text-muted hover:fill-blue-700"
          data-toggle="modal"
          title="Editar"
        >
          <CIcon 
            icon={cilPencil} 
            size="lg" 
            className="fill-gray-500 " // Azul fuerte como acordamos
            onClick={() => handleClickEditar(row.original)}
          />
        </a>
                  
        <a
          href="#deleteEmployeeModal"
          className="text-muted hover:text-danger"  /* Color base */
          data-toggle="modal"
          title="Borrar"
        >
          <CIcon 
            icon={cilTrash} 
            size="lg" 
            className=""  /* Efecto hover */
            onClick={() => handleDelete(row.original)}
          />
        </a>
      </div>)
    },
    enableSorting: false, // Se deshabilita el ordenamiento en esta columna ('actions').
    enableColumnFilter: false, // Se deshabilita el filtrado
  })
];


// Componente del documento PDF
const MyDocument = ({ table, format = 'compact' }) => {
  const filteredRows = table.getFilteredRowModel().rows;
 const styles = format === 'compact' ? compactStyles : detailedStyles; // Selecciona estilos según formato


  return (
    <Document>    {/* Componente de React-PDF (MyDocument) que genera un PDF a partir de los datos filtrados de la tabla*/}
      <Page style={styles.page}>
        <Text style={styles.title}>Administración de Usuarios</Text>
        <View style={styles.table}>
          
          <View style={styles.tableRow}>
            {table.getHeaderGroups()[0].headers
              .filter(header => header.id !== 'actions')    // Excluimos la columna 'action
              .map(header => (
              <Text key={header.id} style={styles.tableHeader}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </Text>
            ))}
          </View>
          
          {filteredRows.map(row => (
            <View key={row.id} style={styles.tableRow}>
              {row
              .getVisibleCells()
              .filter(cell => cell.column.id !== 'actions')    // Excluimos la columna 'action
              .map(cell => (
                <Text key={cell.id} style={styles.tableCell}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};


// Función para generar y descargar el PDF. 
const generatePDF = async (table, format = 'compact') => {
  const doc = <MyDocument table={table} />;
  const asPdf = pdf([]); // Crear instancia de PDF
  asPdf.updateContainer(doc); // Añadir el documento
  const blob = await asPdf.toBlob(); // Generar el PDF como Blob
  saveAs(blob, 'tabla_filtrada.pdf'); // Descargar el archivo
}


 
const Dashboard = () => {
  const [tableData, setTableData] = useState([])

  const [searchTerm, setSearchTerm] = useState(''); // Búsqueda dinámica. Estado para el término de búsqueda global
  const [visibleXL, setVisibleXL] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  

  const [filterColumn1, setFilterColumn1] = useState('name'); // Columna predeterminada para el primer filtro
  const [filterValue1, setFilterValue1] = useState(''); // Valor del primer filtro
  const [filterColumn2, setFilterColumn2] = useState('domicilio'); // Columna predeterminada para el segundo filtro
  const [filterValue2, setFilterValue2] = useState(''); // Valor del segundo filtro
  const [columnFilters, setColumnFilters] = useState([]); // Estado de filtros para TanStack
    
  //Leemos los datos de data/datos.json
  useEffect(() => {
    // Realizar la solicitud fetch
    fetch('../../../data/datos.json')
      .then(response => response.json())  // Convertimos la respuesta a formato JSON
      .then(data => {
        setTableData(data);  // Actualizamos el estado con los datos cargados
        })
      .catch(error => {
        console.error('Error al cargar los datos:', error);
        });
      
  }, []);  // El array vacío significa que esto solo se ejecuta al montar el componente
  
  /*  ---------------------  Paginación  -----------------------  */
  // Estado de paginación
  // "pagination" le dice a TanStack Table cómo dividirla en páginas.
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Página inicial (comienza en la página 0, que es al primera)
    pageSize: 10,  // Número de filas por página (muestra 2 filas por página)
  });

  /*  ---------------------  Ordenamiento  -----------------------  */
  //  Estado para el ordenamiento
  const [sorting, setSorting] = useState([]); // "sorting" es un array de objetos como id de la columna y dirección. Se inicializa vacío.

  /*  ---------------------  Filtro -----------------------  */
  // Función para aplicar filtros al hacer clic en "Buscar"
  const applyFilters = () => {
    const filters = [];
    if (filterValue1) {
      filters.push({ id: filterColumn1, value: filterValue1 });
    }
    if (filterValue2) {
      filters.push({ id: filterColumn2, value: filterValue2 });
    }
    setColumnFilters(filters); // Actualiza los filtros en TanStack
  };



  /*  ---------------------  Configuración de la tabla  -----------------------  */
  // Instancia de la tabla (useReactTable) es el "cerebro" de TanStack Table. 
  // La variable "table" (creada con useReactTable) contiene toda la lógica y los métodos para manejar la tabla, 
  // como paginación, filas, y renderizado.
  const table = useReactTable({
    data: tableData,              // Datos de la tabla, obtenidos de datos.json 
    columns,                      // Columnas definidas anteriormente
    
    getCoreRowModel: getCoreRowModel(),   // función de TanStack. Genera el modelo básico de filas
    getPaginationRowModel: getPaginationRowModel(), // Activa la paginación, divide filas en páginas según pageSize y pageIndex.
    onPaginationChange: setPagination, // Actualiza el estado de paginación al cambiar de página    
    
    getSortedRowModel: getSortedRowModel(), // Activar ordenamiento
    onSortingChange: setSorting, // Actualizar estado de ordenamiento

    getFilteredRowModel: getFilteredRowModel(), // Activar filtrado
    onGlobalFilterChange: setSearchTerm, // Actualiza el filtro global
    onColumnFiltersChange: setColumnFilters, // Actualiza filtros por columna

    state: { 
      pagination,   // Pasa el estado de paginación a TanStack, para que sepa que pagina mostrar
      sorting,  // Pasar el estado de ordenamiento
      globalFilter: searchTerm, // Pasar el filtro global al estado
      columnFilters, // Pasar filtros por columna
    }, 
  });

  const handleExportClick= () => {
    generatePDF(table, 'compact');
  }

  // const MyDocument = ({ table, format = 'compact' }) => {
  const handlePrintButton = async (table) => {
  
   // Genera el PDF usando la función generatePDF ya definida (para generar el PDF)
  const blob = await generatePDFBlob(table); // Nueva función auxiliar para obtener solo el Blob
  const pdfUrl = URL.createObjectURL(blob); // Crea una URL temporal para el Blob
    
    
    
    window.print();
  }
  
 
    

  return (
    <CContainer>
     
      <CCard className="mb-4">
        <CCardBody className="p-3">        {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}
          <CRow className=  "justify-content-between align-items-center"> {/* Fila en la grilla.*/  }
            
            <CCol xs={12} sm="auto">    {/* Columna dentro de fila. Ocupa 5 de 12 unidades disponibles. Hereda gutter de CRow*/}
              <h4 id="titulo" className="card-title mb-0">
                Administración de Usuarios
              </h4>
              <div className="small text-body-secondary"> Administradores del sistema</div>
            </CCol>

            <CCol xs={12} sm="auto">  {/* Columna para el botón Agregar Usuario */}
              <CButton 
                type="submit"
                color="primary" 
                className="shadow-sm" 
                size="sm"
                onClick={() => setVisibleXL(!visibleXL)}
                >
                Nuevo
              </CButton>
            </CCol>

            <CModal
              size="xl"
              visible={visibleXL}
              onClose={() => setVisibleXL(false)}
              aria-labelledby="OptionalSizesExample1"
             > 
              <CModalHeader>
                <CModalTitle id="OptionalSizesExample1">Nuevo usuario</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <FormAltaUsuario id="modalInput1" label="Nuevo Campo 1" placeholder="Escribe algo aquí..." />
              </CModalBody>
            </CModal>
          </CRow>

        </CCardBody>
        
          <CCardFooter className="px-4 py-2 bg-light"> {/* Fondo claro y padding */}
            <CRow
              xs={{ cols: 1, gutter: 2 }}
              sm={{ cols: 2 }}
              lg={{ cols: 3 }}
              className="justify-content-en"
              >
              
              <CCol xs={12} sm={8} md={6} lg={4}> {/* Ancho progresivo */}
                <div  className=" py-1 " >
                  <CInputGroup className="shadow-sm border-0 mb-0 size=sm">
                    <CInputGroupText>Filtrar por</CInputGroupText>
                    <CFormSelect
                      value={filterColumn1}
                      onChange={(e) => setFilterColumn1(e.target.value)}
                      className="form-select"
                    >
                      <option value="name">Nombre</option>
                      <option value="email">Mail</option>
                      <option value="domicilio">Domicilio</option>
                      <option value="telefono">Teléfono</option>
                    </CFormSelect>
                    <CFormInput
                      placeholder="Valor a buscar"
                      value={filterValue1}
                      onChange={(e) => setFilterValue1(e.target.value)}
                    />
                  </CInputGroup >

                  <CInputGroup className="shadow-sm border-0 mb-0 size=sm mb-3">
                    <CInputGroupText>Filtrar por</CInputGroupText>
                    <CFormSelect
                      value={filterColumn2}
                      onChange={(e) => setFilterColumn2(e.target.value)}
                      className="form-select"
                    >
                      <option value="name">Nombre</option>
                      <option value="email">Mail</option>
                      <option value="domicilio">Domicilio</option>
                      <option value="telefono">Teléfono</option>
                    </CFormSelect>
                    <CFormInput
                      placeholder="Valor a buscar"
                      value={filterValue2}
                      onChange={(e) => setFilterValue2(e.target.value)}
                    />
                  </CInputGroup>
                  
                  <CButton color="primary" size="sm" onClick={applyFilters}>
                    Filtrar
                  </CButton>

                  
                </div>
              </CCol>

              <CCol></CCol>

              <CCol xs={12} sm={8} md={6} lg={4}> {/* Ancho progresivo */}
                <div  className=" py-1 " >
                  <CInputGroup className="shadow-sm border-0"  > {/* Sombra y sin borde */}
                    <CInputGroupText id="basic-addon1" >Buscar</CInputGroupText>
                    <CFormInput 
                      placeholder="Ingrese el texo a buscar" 
                      aria-label="Username" 
                      aria-describedby="basic-addon1"
                      value={searchTerm} // Búsqueda dinámica. Vinculamos el valor del input al estado
                      onChange={(e) => setSearchTerm(e.target.value)} // Búsqueda dinámica. Actualizamos el estado al escribir
                    />
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            <CRow className="justify-content-end pt-1 pb-2 mt-1 mb-0 me-0  ">
                  
            <CCol  md={4}  className='text-end px-0 ' >
              <div className='d-flex justify-content-end gap-2'>
                {/* ----------  Botón para imprimir --------------- */}
                <CButton 
                  type="button"
                  color="secondary" 
                  className="shadow-sm px-2 py-1 me-0"
                  variant="outline"
                  size="sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick = {() => handlePrintButton()}
                  //onClick = {() => window.print()}
                  >
                    Imprimir
                </CButton>
                {/* ----------  Fin Botón para imprimir  --------------- */}


                {/* ----------  Botón para exportar a CSV --------------- */}
                <CButton 
                  type="button"
                  color="secondary" 
                  className="shadow-sm px-2 py-1"
                  variant="outline"
                  size="sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick = {handleExportClick}
                  >
                    Expotar
                </CButton>
                {/* ----------  Fin Botón para exportar a CSV --------------- */}
              </div>  
            </CCol>  
          </CRow>
            
          </CCardFooter >

        <CCardBody className="justify-content-center py-1 ">

          <CRow className="justify-content-end pt-1 pb-2 mt-1 mb-0 me-0 ">
                  
            <CCol  md={4}  className='text-end px-0 ' >
            </CCol>  

          </CRow>
          
          {/* ----------------------------------- TABLA ----------------------------------- */}

          <CTable id='mainTable' hover responsive  >
            <CTableHead className="px-4 py-2 bg-primary">
              {table.getHeaderGroups().map(headerGroup => (           //Devuelve array de grupos de encabezados (1 en este caso)
                <CTableRow className="justify-content-end pt-1 pb-2 mt-1 mb-0 me-0 " key={headerGroup.id}>
                  {headerGroup.headers.map(column => (       // Recorre las columnas y devuelve un array de los headers
                    <CTableHeaderCell 
                      key={column.id}
                      onClick={column.column.getToggleSortingHandler()} // encabezado clicable para ordenar
                      style={{ cursor: column.column.getCanSort() ? 'pointer' : 'default' }} // Cursor pointer si es ordenable
                    >
                      {flexRender(column.column.columnDef.header, column.getContext())} {/*Renderiza los header con flexRender*/}
                      { column.column.getCanSort() ? {        // Si la columna no es ordenable, no muestra icono
                          asc: <CIcon icon={cilArrowTop} size="sm"/> , // Ascendente cilSortAlphaUp cilSortNumericUp cilArrowTop
                          desc: <CIcon icon={cilArrowBottom} size="sm"/>, // Descendente cilSortAlphaDown cilSortNumericDown cilArrowBottom
                        } [column.column.getIsSorted()] || <CIcon icon= {cilSwapVertical} className="text-body-secondary" />
                        : null 
                      }             
                      
                    </CTableHeaderCell>
                  ))}
                </CTableRow>
              ))}
            </CTableHead>

            <CTableBody>
              {table.getRowModel().rows.map(row => (    // Devuelve las filas visibles según la paginación actual ("pageSize").
                                                        // rows.map(...) recorre cada fila, y row.getVisibleCells() da las celdas de esa fila.
                <CTableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <CTableDataCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())} {/* Renderiza el contenido de cada celda (mediante flexrender) */}
                    </CTableDataCell>
                  ))}
                </CTableRow>
              ))}
            </CTableBody>
          
          </CTable>
          
          {/* ---------------------  Controles de paginación ------------------------- */}
          <div>
            <CPagination align="end" size="sm" aria-label="Page navigation">

            <CPaginationItem 
                aria-label="Next"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span aria-hidden="true">&laquo;</span>
              </CPaginationItem>
                              
              
              {/* items nros de página del paginado */}
              {Array.from({ length: table.getPageCount() }, (_, i) => (   //table.getPageCount() = nº total filas / pageSize

                <CPaginationItem
                  key={i}
                  active={i === table.getState().pagination.pageIndex} // Muestra la página actual
                  onClick={() => table.setPageIndex(i)}     // Cambia a una página específica
                >
                  {i + 1}       {/* Suma 1 porque el array comienza de 0*/}
                </CPaginationItem>
              ))}

              
              <CPaginationItem 
                aria-label="Previous"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span aria-hidden="true">&raquo;</span>
              </CPaginationItem>

            </CPagination>
          </div>

          <div>
            <span>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} {/* Suma 1 porque el array comienza de 0*/}
            </span>

            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              style={{ marginLeft: '10px' }}
            >
              {[2, 5, 10, 20].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Mostrar {pageSize}
                </option>
              ))}
            
            </select>
          </div>


        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Dashboard
