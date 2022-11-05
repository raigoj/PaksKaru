import React, {useState} from "react"
import { DesignEditorContext } from "~/contexts/DesignEditor"
import useDesignEditorPages from "~/hooks/useDesignEditorScenes"
import { getDefaultTemplate } from "~/constants/design-editor"
import { Button, SIZE } from "baseui/button"
import { textComponents } from "~/constants/editor"
import { useStyletron } from "styletron-react"
import { useEditor } from "@layerhub-io/react"
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
import { queryClient } from "~/main"
import { addScene } from "../../Footer/Presentation/Scenes"

async function fetchImage(kw) {
  console.log(kw)
  let x = {version: "8abccf52e7cba9f6e82317253f4a3549082e966db5584e92c808ece132037776", input: {prompt: kw}}
  x = JSON.stringify(x)
  return await fetch("https://api.replicate.com/v1/predictions", {
    body: x,
    mode: 'no-cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      "Authorization": 'Token 5f0445d9cef28e21d2dc1e30c446dbe523517e97',
      "Content-Type": "application/json"
    },
    method: "POST"
  }).then((response) => {
    response.json().then(i => console.log(i))
    return response.json()
  });
}
async function fetchText(kw) {
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
  const scenes = useDesignEditorPages()
  const [selected, setSelected] = useState();
  const [currentPreview, setCurrentPreview] = React.useState("")
  const { setScenes, setCurrentScene, currentScene, setCurrentDesign, currentDesign } =
    React.useContext(DesignEditorContext)

  let {
    isLoading,
    data: adData,
    isError,
    isStale,
    error,
    isPreviousData,
    refetch
  } = useQuery(["company"], () => fetchText(selected), {
    refetchOnWindowFocus: false,
    enabled: false,
    refetchOnMount: false,
    retry: 1,
    staleTime: 200,
  });

  let {
    data: imgData,
  } = useQuery(["image"], () => fetchImage(adData.Sentence), {
    refetchOnWindowFocus: false,
    enabled: false,
    refetchOnMount: false,
    retry: 1,
    staleTime: 200,
  });
  if (imgData) {
    console.log(imgData)
  }

  const getText = () => {
    if (selected) {
      refetch()
    }
  }

  const editor = useEditor()

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
        fill: "white",
        fontFamily: font.name,
        textAlign: "center",
        fontStyle: "normal",
        fontURL: font.url,
        stroke: "#000000",
        strokeWidth: 2,
        metadata: {
        },
      }
      editor.objects.add(options)
    }
  }

  const addScene = React.useCallback(async () => {
    setCurrentPreview("")
    const updatedTemplate = editor.scene.exportToJSON()
    const updatedPreview = await editor.renderer.render(updatedTemplate)

    const updatedPages = scenes.map((p) => {
      if (p.id === updatedTemplate.id) {
        return { ...updatedTemplate, preview: updatedPreview }
      }
      return p
    })

    const defaultTemplate = getDefaultTemplate(currentDesign.frame)
    const newPreview = await editor.renderer.render(defaultTemplate)
    const newPage = { ...defaultTemplate, id: nanoid(), preview: newPreview } as any
    const newPages = [...updatedPages, newPage] as any[]
    setScenes(newPages)
    setCurrentScene(newPage)
    console.log("Add scene", newPage)
    return Promise.resolve()
  }, [scenes, currentDesign])

  const addAllScenes = async () => {
    console.log("LAW")
    for (let i = 0; i < 3; i++) {
      console.log("SPACE")
      let x = await addObject(adData.Sentence[i])
      let y = await addScene()
    }
  }

  if (adData && copies && !isStale) {
    addAllScenes()
    setCopies(false)
    setSelected(undefined)
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
            },
            },
            }}
          >
            Add text
          </Button>
          <Button onClick={() => setCopies(!copies)}>Create copy</Button>
          {copies && 
          <div>
            <TagsInput
              value={selected}
              onChange={setSelected}
              name="fruits"
              placeHolder="enter keywords"
            />
          <Button onClick={getText}>Create</Button>
          </div>
          }
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