import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFilePdf,
  faArrowUpRightFromSquare,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
} from '@fortawesome/free-solid-svg-icons'

import Dots from 'react-activity/dist/Dots'
import YouTube from 'react-youtube'
import 'react-activity/dist/Dots.css'

import Base64Downloader from 'common-base64-downloader-react'

import styles from './Courses.module.css'

import { Row } from '../../components/row/Row'
import { Column } from '../../components/column/Column'
import { SidebarItem } from './SidebarItem'
import { Input } from '../../components/input/Input'
import { Chat, Info } from '../../components/icons/icons'
import { SubmitDoubtModal } from '../../components/modal/SubmitDoubtModal'

export const CourseDetails = () => {
  const [openDoubtModal, setOpenDoubtModal] = useState(false)
  const [videoId, setVideoId] = useState('')
  const [title, setTitle] = useState('')
  const { courseId } = useParams()
  const [playList, setPlayList] = useState(undefined)
  const [clickedItem, setClickedItem] = useState('')
  const [togglePlaylistContent, setTogglePlaylistContent] = useState(false)

  const leftAside = [
    { name: 'Material e Conteúdo do curso', to: 'content' },
    { name: 'Lista de vídeos do curso', subMenu: playList, to: 'playlist' }
  ]

  const course = useSelector(state => state.courses.courses.find(
    course => course._id === courseId
  ))

  const { youtubeApiKey, playlistId } = course
  const BASE_URL = 'https://www.googleapis.com/youtube/v3/playlistItems?'

  const opts = {
    height: '380',
    width: '720',
    playerVars: { autoplay: 0 }
  }

  const _onReady = (event) => {
    event.target.pauseVideo()
  }

  useEffect(() => {
    if (!!youtubeApiKey && !!playlistId) {
      fetch(`${BASE_URL}part=snippet&playlistId=${playlistId}&maxResults=50&key=${youtubeApiKey}`)
        .then(response => response.json())
        .then(data => {
          setClickedItem(data.items[0].snippet.title)

          return setPlayList(data.items)
        })
    } else {
      setClickedItem('Material e Conteúdo do curso')
      setTogglePlaylistContent(true)
    }
  }, [])

  if (!course) {
    return <Navigate to='/' replace />
  }

  return (
    <>
      <SubmitDoubtModal
        setVisible={() => setOpenDoubtModal(false)}
        visible={openDoubtModal}
      />
      <div className={styles.courseDetails}>
        <Row style={{ paddingTop: '8rem' }}>
          <Column style={{ width: '17rem', background: '#E6EFE6', position: 'sticky', top: '8rem' }}>
            <aside className={styles.leftAside}>
              <ul>
                {leftAside.map((item, index) => (
                  <SidebarItem
                    key={index}
                    item={item}
                    clickedItem={clickedItem}
                    setClickedItem={setClickedItem}
                    setVideoId={setVideoId}
                    setTitle={setTitle}
                    togglePlaylistContent={togglePlaylistContent}
                    setTogglePlaylistContent={setTogglePlaylistContent}
                  />
                ))}
              </ul>
            </aside>
          </Column>
          <Column style={{ width: 'calc(100% - 31rem)' }}>
            {!togglePlaylistContent ? (
              <main className={styles.main}>
                {!!playList && (
                  <>
                    <p style={{
                      marginTop: 0,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--main-color)',
                    }}>
                      {course.title}:&nbsp;
                      <span style={{ fontWeight: 400 }}>
                        {!!title ? title : playList[0].snippet.title}
                      </span>
                    </p>

                    <div className={styles.holdsTheIframe}>
                      <Dots
                        size={25}
                        color='#fff'
                        style={{
                          position: 'absolute',
                          top: '46%',
                          left: '50%',
                          transform: 'translate(-50%, -46%)',
                          zIndex: 1
                        }}
                      />
                      <YouTube
                        videoId={!!videoId ? videoId : playList[0].snippet.resourceId.videoId}
                        opts={opts}
                        onReady={_onReady}
                        style={{ borderRadius: 10, zIndex: 2, position: 'absolute' }}
                      />
                    </div>
                  </>
                )}
              </main>
            ) : (
              <main className={styles.main}>
                <p
                  style={{
                    marginTop: 0,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--main-color)',
                  }}
                >
                  Material e Conteúdo do curso
                </p>

                {course.content ? course.content.rowOrder.map((rowId) => {
                  const row = course.content.rows[rowId]
                  const docs = row.docIds.map((docId) => course.content.docs[docId])

                  return (
                    <div key={row.id}>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          background: '#F6F9F6',
                          padding: 6,
                          boxShadow: '0 1px 1px 0 rgba(20, 111, 18, .5)',
                          borderRadius: 2,
                          fontWeight: 500,
                          color: 'var(--main-color)',
                        }}
                      >{row.title}</p>

                      <div>
                        {docs.map(resource => {
                          const fileIcon = resource.label === 'URL / Link'
                            ? faArrowUpRightFromSquare
                            : resource.label === 'Documento em PDF'
                              ? faFilePdf
                              : resource.label === 'Documento em WORD'
                                ? faFileWord
                                : resource.label === 'Documento em Excel'
                                  ? faFileExcel
                                  : faFilePowerpoint

                          const fileName = Object.keys(resource).filter(
                            value => value !== 'title' && value !== 'id' && value !== 'color' && value !== 'label' && value !== 'url'
                          ).join()

                          console.log('filename', resource[fileName])


                          return fileName ? (
                            <Base64Downloader
                              style={{ display: 'block', padding: 0, margin: 0, background: 'none', border: 'none', outline: 'none', width: '100%' }}
                              base64={resource[fileName].base64}
                              downloadName={resource.title}
                            >
                              <div
                                key={resource.id}
                                style={{
                                  fontSize: '0.8rem',
                                  marginBottom: 12,
                                  marginLeft: 10,
                                  background: '#F6F9F6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: 4,
                                  cursor: 'pointer'
                                }}
                                className={styles.files}
                              >
                                <FontAwesomeIcon color={resource.color} icon={fileIcon}></FontAwesomeIcon>
                                &nbsp;&nbsp;<span style={{
                                  textDecoration: 'underline',
                                  textDecorationColor: 'var(--main-color)',
                                }}>{resource.title}</span>
                              </div>
                            </Base64Downloader>
                          ) : (
                            <a target='_blank' href={resource.url} rel='noreferrer' style={{ display: 'block', color: 'black' }}>
                              <div
                                key={resource.id}
                                style={{
                                  fontSize: '0.8rem',
                                  marginBottom: 12,
                                  marginLeft: 10,
                                  background: '#F6F9F6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: 4,
                                  cursor: 'pointer'
                                }}
                                className={styles.files}
                              >
                                <FontAwesomeIcon color={resource.color} icon={fileIcon}></FontAwesomeIcon>
                                &nbsp;&nbsp;<span style={{
                                  textDecoration: 'underline',
                                  textDecorationColor: 'var(--main-color)',
                                }}>{resource.title}</span>
                              </div>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )
                }) : (
                  <div
                    style={{
                      fontSize: '0.8rem',
                      marginBottom: 12,
                      background: '#F6F9F6',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Nenhum Conteúdo do curso encontrado!!!
                  </div>
                )}
              </main>
            )}
          </Column>

          <Column style={{ width: '14rem', position: 'sticky', top: '8rem' }}>
            <aside className={styles.rightAside}>
              <ul style={{ background: '#E6EFE6', height: '16rem' }}>
                <li
                  style={{
                    background: '#CFE1CF',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--main-color)',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Chat style={{ width: '1.3rem', color: '#178415' }} />
                  Dúvidas
                </li>
                <li style={{}}>
                  <Input
                    style={{
                      paddingTop: 20,
                      paddingBottom: 20,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <button type='button' style={{ width: '90%' }}
                      onClick={() => setOpenDoubtModal(true)}
                    >Envie sua dúvida aqui</button>
                  </Input>
                </li>
                <li
                  style={{
                    background: '#CFE1CF',
                    padding: '0.45rem 0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--main-color)',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Info style={{ width: '1rem', color: '#178415' }} />
                  Detalhes do Curso
                </li>
                <li style={{ fontSize: 'var(--main-font-size)', padding: '1rem 0.5rem', textAlign: 'center' }}>
                  Duração do curso: <span style={{ color: 'var(--main-color)' }}>{course.duration}</span>
                </li>
              </ul>
            </aside>
          </Column>
        </Row>
      </div>
    </>
  )
}

