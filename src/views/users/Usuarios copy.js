import React,  { useState, useEffect }  from 'react'
import classNames from 'classnames'

import { CAvatar, CButton, CButtonGroup, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CProgress, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormCheck, CFormInput, CFormLabel, CFormTextarea, CInputGroup,  CInputGroupText, CContainer} from '@coreui/react'

import { cibCcAmex, cibCcApplePay, cibCcMastercard, cibCcPaypal, cibCcStripe, cibCcVisa, cibGoogle, cibFacebook, cibLinkedin, cifBr, cifEs, cifFr, cifIn, cifPl, cifUs, cibTwitter, cilCloudDownload, cilPeople, cilUser, cilUserFemale, cilTrash, cilPencil} from '@coreui/icons'

import { CIcon } from '@coreui/icons-react';

import FormAltaUsuario from '../../components/FormAltaUsuario'; // Importa el componente TextInput FormAltaUsuario.js
import { CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'

import { CSVLink } from "react-csv";


// Datos ficticios para los encabezados
const csvHeaders = [
  { label: "Nombre", key: "name" },
  { label: "Edad", key: "age" },
  { label: "Ciudad", key: "city" },
  { label: "Ocupación", key: "occupation" }
];

// Datos ficticios para el contenido
const csvData = [
  { name: "Ana López", age: 28, city: "Madrid", occupation: "Diseñadora" },
  { name: "Carlos Pérez", age: 34, city: "Barcelona", occupation: "Ingeniero" },
  { name: "María Gómez", age: 23, city: "Valencia", occupation: "Estudiante" },
  { name: "Juan Martínez", age: 45, city: "Sevilla", occupation: "Profesor" },
  { name: "Lucía Fernández", age: 31, city: "Bilbao", occupation: "Médica" }
];




const Dashboard = () => {

  const [tableExample, setTableExample] = useState([]);
  
  const [selected, setSelected] = useState([]) // Estado para manejar checkboxes
  const [selectAll, setSelectAll] = useState(false) // Estado del checkbox general

  const [searchTerm, setSearchTerm] = useState(''); // Búsqueda dinámica. Estado para el término de búsqueda

  const [visibleXL, setVisibleXL] = useState(false)

  const [filename, setFilename] = useState('');
  
  // Leer nombre de archivo
  const getFileName = () => {
    if (!filename) return 'usuarios_ficticios.csv';
    if (!filename.endsWith('.csv')) return `${filename}.csv`;
    return filename;
  };



  //Leemos los datos de data/datos.json
  // Usamos useEffect para obtener los datos una vez que el componente se haya montado
  useEffect(() => {
    // Realizar la solicitud fetch
    fetch('../../../data/datos.json')
      .then(response => response.json())  // Convertimos la respuesta a formato JSON
      .then(data => {
        setTableExample(data);  // Guardamos los datos en el estado
      })
      .catch(error => {
        console.error('Error al cargar los datos:', error);
      });
  }, []);  // El array vacío significa que esto solo se ejecuta al montar el componente
  


  // Manejar el checkbox principal (Seleccionar/Deseleccionar todos)
  const handleSelectAll = () => {
    if (!selectAll) {
      // Seleccionar todos: agregar todos los IDs al array
      //const allIds = tableExample.map(item => item.id) // Búsqueda dinámica. Se comentó
      const allIds = filteredTable.map(item => item.id); // Búsqueda dinámica. Usamos la tabla filtrada
      setSelected(allIds)
    } else {
      // Deseleccionar todos: vaciar el array
      setSelected([])
    }
    console.log(selected);
    setSelectAll(!selectAll)
    console.log(selected);
  }

  // Manejar selección individual de cada checkbox
  const handleSelect = (id) => {
    
    if (selected.includes(id)) {
       // Si ya está seleccionado, lo quitamos
      setSelected(selected.filter(item => item !== id))
      
      // Si después de quitar quedan menos que todos, desmarcamos selectAll
      if (selected.length - 1 < tableExample.length) {
        setSelectAll(false)
      }

    } else {

      // Si no está seleccionado, lo agregamos
      const newSelected = [...selected, id]
      setSelected(newSelected)
      
      // Si ahora están todos seleccionados, marcamos selectAll
      if (newSelected.length === tableExample.length) {
        setSelectAll(true)
      }
    }
  }

  // Búsqueda dinámica. Filtrar la tabla según el término de búsqueda
  const filteredTable = tableExample.filter(item =>
    item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.domicilio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.telefono.includes(searchTerm)
  );


  return (
    <CContainer>
     
      <CCard className="mb-4">
        <CCardBody className="p-3">        {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}
          <CRow className=  "justify-content-between align-items-center"> {/* Fila en la grilla. Organiza las CCol hor. */  }
            
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
              
              <CCol></CCol>
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

            <CRow className="justify-content-end py-1">
                
                <CCol></CCol>

                <CCol>
                  <CFormInput
                    md={4} 
                    type="text"
                    placeholder="Nombre del archivo"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="shadow-sm"  />              
                </CCol>
                
                <CCol  md={4}  className='text-end' >
                  <CSVLink
                    headers={csvHeaders}
                    data={filteredTable}
                    filename={getFileName()}
                    className="text-decoration-none"  >
                      <CButton 
                        type="button"
                        color="secondary" 
                        className="shadow-sm px-2 py-1"
                        variant="outline"
                        size="sm"
                        style={{ fontSize: '0.75rem' }} 
                        >
                          Expotar
                      </CButton>
                  </CSVLink> 
                </CCol>  
            
            </CRow>


          </CCardFooter >

        <CCardBody >
          
              <CTable 
                align="middle" 
                className="mb-3 border shadow-sm"  /* Ajusto margen y agrego sombra */
                hover 
                responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    
                    <CTableHeaderCell className="bg-body-tertiary text-center py-2">
                      <CFormCheck 
                        id="selectAll"
                        checked={selectAll}
                        label=""                  /*Falta borde negro*/
                        aria-label="Marcar todos"
                        className="border-0"  /* Quito borde para diseño minimalista */
                        onChange={handleSelectAll} // Manejar selección general

                        />

                    </CTableHeaderCell>
                    
                    <CTableHeaderCell className="bg-body-tertiary py-2 text-left">
                      Nombre y Apellido
                    </CTableHeaderCell>

                    <CTableHeaderCell className="bg-body-tertiary py-2 text-left">
                      Email
                    </CTableHeaderCell>

                    <CTableHeaderCell className="bg-body-tertiary py-2 text-left">
                      Domicilio
                    </CTableHeaderCell>
                    
                    <CTableHeaderCell className="bg-body-tertiary py-2 text-left">
                      Teléfono
                    </CTableHeaderCell>
                    
                    <CTableHeaderCell className="bg-body-tertiary py-2 text-center" >
                      Acción
                    </CTableHeaderCell>

                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  
                  {filteredTable.map((item) => ( // Búsqueda dinámica. Usamos filteredTable en lugar de tableExample
                  //{tableExample.map((item, index) => (
                    <CTableRow v-for="item in tableItems" key={item.id}>
                     <CTableDataCell className="text-center py-2">
                        
                        <CFormCheck 
                          id={`checkbox-${item.id}`}  /* ID único */
                          checked={selected.includes(item.id)}  // Controlamos el estado
                          onChange={(e) => {handleSelect(item.id)
                          }}
                        />
                        </CTableDataCell>
                      
                        <CTableDataCell className="text-left py-2">
                          {item.user.name}
                        </CTableDataCell>
                          
                        <CTableDataCell className="text-left py-2">
                          {item.user.email}
                        </CTableDataCell>
                          
                        <CTableDataCell className="text-left py-2">
                          {item.user.domicilio}                     
                        </CTableDataCell>

                        <CTableDataCell className="text-left py-2">
                          {item.user.telefono}
                        </CTableDataCell>
                                            
                        <CTableDataCell className="text-center" py-2>
                        <div className="d-flex justify-content-center gap-3"> {/* Contenedor flexible para íconos */}
                        <a
                          href="#editEmployeeModal"
                          className="text-muted"  /* Color base */
                          data-toggle="modal"
                          title="Editar"
                        >
                          <CIcon 
                            icon={cilPencil} 
                            size="lg" 
                            className="hover:text-primary"  /* Efecto hover */
                          />

                        </a>

                        <a
                          href="#deleteEmployeeModal"
                          className="text-muted"  /* Color base */
                          data-toggle="modal"
                          title="Borrar"
                        >
                          <CIcon 
                            icon={cilTrash} 
                            size="lg" 
                            className="hover:text-danger"  /* Efecto hover */
                          />
                        </a>
                      </div>
                    </CTableDataCell>
                    
                    
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>


        <CCardBody>

        </CCardBody>

      </CCard>
           
      
    </CContainer>
  )
}

export default Dashboard
