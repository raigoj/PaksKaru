import React, {useState} from "react"
import { DesignEditorContext } from "~/contexts/DesignEditor"
import useDesignEditorPages from "~/hooks/useDesignEditorScenes"
import { getDefaultTemplate } from "~/constants/design-editor"
import { Button, SIZE } from "baseui/button"
import { textComponents } from "~/constants/editor"
import { useStyletron } from "styletron-react"
import { useActiveObject, useEditor } from "@layerhub-io/react"
import { FontItem } from "~/interfaces/common"
import { loadFonts } from "~/utils/fonts"
import { ILayer, IStaticText } from "@layerhub-io/types"
import { nanoid } from "nanoid"
import { Block } from "baseui/block"
import AngleDoubleLeft from "~/components/Icons/AngleDoubleLeft"
import Scrollable from "~/components/Scrollable"
import useSetIsSidebarOpen from "~/hooks/useSetIsSidebarOpen"
import { useSelector } from "react-redux"
import { selectPublicComponents } from "~/store/slices/components/selectors"
import api from "~/services/api"
import { IComponent } from "~/interfaces/DesignEditor"
import { TagsInput } from "react-tag-input-component";
import { useQuery } from "@tanstack/react-query";
import {queryClient } from "../../../../../main"
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 9998800 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}
async function fetchImage(kw, selected) {
  console.log(selected)
  let i = selected.join(", ")
  let y = `${kw}, ${i}`
  console.log(y)
  let x = JSON.stringify({Sentence: y})
  return await fetchWithTimeout(`http://localhost:8080/img?s=${kw}`, {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      "Content-Type": "application/json"
    },
    method: "GET",
  }).then((response) => {
    return response.json()
  });
}
async function fetchText(kw, {setImgSet}) {
  setImgSet(false)
  queryClient.invalidateQueries(["image"])
  kw = {keywords: kw}
  let x = JSON.stringify(kw)
  return await fetch(`http://localhost:8080/`, {
    method: 'POST',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json'
  },
  body: x
  }).then((response) =>
  response.json()
         );
}

const textOptions = {
  id: nanoid(),
  type: "StaticText",
  width: 420,
  text: "Add some text",
  fontSize: 92,
  fontFamily: "OpenSans-Regular",
  textAlign: "center",
  fontStyle: "normal",
  fontURL:
    "https://fonts.gstatic.com/s/opensans/v27/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C4nY1M2xLER.ttf",
  fill: "#333333",
  metadata: {},
}

export default function () {
  const [copies, setCopies] = useState(false);
  const [imgSet, setImgSet] = useState(false);
  const scenes = useDesignEditorPages()
  const activeObject: any = useActiveObject()
  const [selected, setSelected] = useState();
  const [currentPreview, setCurrentPreview] = React.useState("")
  const { setScenes, setCurrentScene, currentScene, setCurrentDesign, currentDesign } =
    React.useContext(DesignEditorContext)
  React.useEffect(() => {
    {activeObject?.type === "StaticImage" && (
      editor.objects.setAsBackgroundImage()
    )}
    {activeObject?.type === "StaticText" && (
      editor.objects.update({
        stroke: "#000000",
        fill: null,
        strokeWidth: 2,
        shadow: {
          blur: 25,
          color: "rgba(0,0,0,0.45)",
          offsetX: 0,
          offsetY: 0,
          enabled: false,
        },
      })
    )}
  })

  let {
    data: adData,
    isError,
    isStale,
    error,
    isPreviousData,
    refetch
  } = useQuery(["company"], () => fetchText(selected, {setImgSet}), {
    refetchOnWindowFocus: false,
    enabled: false,
    refetchOnMount: false,
    retry: 0,
    staleTime: 200,
  });

  let {
    data: imgData,
    isLoading,
    isFetching
  } = useQuery(["image"], () => fetchImage(adData.Sentence, selected), {
    refetchOnWindowFocus: false,
    enabled: !!adData,
    refetchOnMount: false,
    retry: 0,
    cacheTime: 10
  });

  const editor = useEditor()
  const addObjectImg = React.useCallback(
    (url: string) => {
      if (editor) {
        const options = {
          type: "StaticImage",
          src: url,
        }
        editor.objects.add(options)
      }
      queryClient.invalidateQueries()
    },
    [editor]
  )

  if (imgData && !imgSet) {
    console.log(imgData)
    addObjectImg(imgData.output[0])
    setImgSet(true)
    editor.objects.setAsBackgroundImage()
  }
  const getText = () => {
    if (selected) {
      refetch()
    }
  }


  const setIsSidebarOpen = useSetIsSidebarOpen()
  const components = useSelector(selectPublicComponents)
  const addObject = async (text) => {
    if (text?.nativeEvent) {
      text = "Add some text"
    }
    if (editor) {
      const font: FontItem = {
        name: "OpenSans-Regular",
        url: "https://fonts.gstatic.com/s/opensans/v27/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C4nY1M2xLER.ttf",
      }
      await loadFonts([font])
      const options = {
        id: nanoid(),
        type: "StaticText",
        width: 420,
        text: text,
        fontSize: 92,
        fontFamily: font.name,
        textAlign: "center",
        fontStyle: "normal",
        fontURL: font.url,
        metadata: {
        },
      }
      setSelected(undefined)
      editor.objects.add(options)
    }
  }


  if (adData && copies && !isStale) {
    addObject(adData.Sentence)
    setCopies(false)
  }

  const addComponent = async (component: any) => {
    if (editor) {
      const fontItemsList: FontItem[] = []
      if (component.objects) {
        component.objects.forEach((object: any) => {
          if (object.type === "StaticText" || object.type === "DynamicText") {
            fontItemsList.push({
              name: object.fontFamily,
              url: object.fontURL,
            })
          }
        })
        const filteredFonts = fontItemsList.filter((f) => !!f.url)
        await loadFonts(filteredFonts)
      } else {
        if (component.type === "StaticText" || component.type === "DynamicText") {
          fontItemsList.push({
            name: component.fontFamily,
            url: component.fontURL,
          })
          await loadFonts(fontItemsList)
        }
      }
      editor.objects.add(component)
    }
  }

  const makeAddComponent = async (id: string) => {
    if (editor) {
      const component = await api.getComponentById(id)
      const fontItemsList: FontItem[] = []
      const object: any = component.layers[0] as ILayer
      if (object.type === "Group") {
        object.objects.forEach((object: any) => {
          if (object.type === "StaticText" || object.type === "DynamicText") {
            fontItemsList.push({
              name: object.fontFamily,
              url: object.fontURL,
            })
          }
        })
        const filteredFonts = fontItemsList.filter((f) => !!f.url)
        await loadFonts(filteredFonts)
      } else {
        if (object.type === "StaticText") {
          fontItemsList.push({
            name: object.fontFamily,
            url: object.fontURL,
          })
          await loadFonts(fontItemsList)
        }
      }

      editor.objects.add(object)
    }
  }

  const loadComponentFonts = async (component: any) => {
    if (editor) {
      const fontItemsList: FontItem[] = []
      if (component.objects) {
        component.objects.forEach((object: any) => {
          if (object.type === "StaticText" || object.type === "DynamicText") {
            fontItemsList.push({
              name: object.fontFamily,
              url: object.fontURL,
            })
          }
        })
        const filteredFonts = fontItemsList.filter((f) => !!f.url)
        await loadFonts(filteredFonts)
      } else {
        if (component.type === "StaticText" || component.type === "DynamicText") {
          fontItemsList.push({
            name: component.fontFamily,
            url: component.fontURL,
          })
          await loadFonts(fontItemsList)
        }
      }
    }
  }

  const onDragStart = React.useCallback(async (ev: React.DragEvent<HTMLDivElement>, item: any) => {
    let img = new Image()
    img.src = item.preview
    ev.dataTransfer.setDragImage(img, img.width / 2, img.height / 2)
    // editor.dragger.onDragStart(item)
  }, [])

  return (
    <Block $style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Block
        $style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 500,
          justifyContent: "space-between",
          padding: "1.5rem",
        }}
      >
        <Block>Text</Block>

        <Block onClick={() => setIsSidebarOpen(false)} $style={{ cursor: "pointer", display: "flex" }}>
          <AngleDoubleLeft size={18} />
        </Block>
      </Block>
      <Scrollable>
        <Block padding={"0 1.5rem"}>
          <Button
            onClick={addObject}
            size={SIZE.compact}
            overrides={{
              Root: {
                style: {
                  width: "100%",
                  backgroundColor: "#1B263B"
            },
            },
            }}
          >
            Add text
          </Button>
          <Button onClick={() => setCopies(!copies)}
            size={SIZE.compact}
            overrides={{
              Root: {
                style: {
                  width: "100%",
                  backgroundColor: "#415A77"
            },
            },
            }}
          >Generate Ad</Button>
          {copies && 
          <div>
            <TagsInput
              value={selected}
              onChange={setSelected}
              name="fruits"
              placeHolder="enter keywords"
            />
            Press enter to add keyword
            <Button onClick={getText}
              size={SIZE.compact}
              overrides={{
                Root: {
                  style: {
                    width: "100%",
                    backgroundColor: "#778DA9"
              },
              },
              }}
            >Create</Button>
          </div>
          }
          {isFetching && <div>Loading image</div>}
          <Block
            $style={{
              paddingTop: "0.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
            }}
          >
            {components?.map((component) => (
              <TextComponentItem
                onDragStart={(ev: React.DragEvent<HTMLDivElement>) => onDragStart(ev, component)}
                onClick={makeAddComponent}
                key={component.id}
                component={component}
              />
            ))}
          </Block>
        </Block>
      </Scrollable>
    </Block>
  )
}

function TextComponentItem({
  component,
  onClick,
  onDragStart,
}: {
  component: IComponent
  onDragStart: (ev: React.DragEvent<HTMLDivElement>) => void
  onClick: (option: any) => void
}) {
  const [css] = useStyletron()
  return (
    <div
      onClick={() => onClick(component.id)}
      onDragStart={onDragStart}
      className={css({
        position: "relative",
        height: "84px",
        background: "#f8f8fb",
        cursor: "pointer",
        padding: "12px",
        borderRadius: "8px",
        overflow: "hidden",
        "::before:hover": {
          opacity: 1,
        },
        userSelect: "all",
      })}
    >
      <img
        src={component.preview.src}
        className={css({
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          verticalAlign: "middle",
        })}
      />
    </div>
  )
}
