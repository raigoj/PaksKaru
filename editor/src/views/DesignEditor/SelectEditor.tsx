import React from "react"
import { Block } from "baseui/block"
import { Button } from "baseui/button"
import { DesignType } from "~/interfaces/DesignEditor"
import useDesignEditorContext from "~/hooks/useDesignEditorContext"
import Video from "~/components/Icons/Video"
import Images from "~/components/Icons/Images"
import Presentation from "~/components/Icons/Presentation"

const SelectEditor = () => {
  const [selectedEditor, setSelectedEditor] = React.useState<DesignType>("GRAPHIC")
  const { setEditorType } = useDesignEditorContext()
  setEditorType(selectedEditor)
}

export default SelectEditor
