import { useState } from "react";
import { ColorInput, Table, Text } from "@mantine/core";
import { colorForTag } from "../hashtagColors";
import type { TagColor } from "../store";

interface TagManagerItemProps {
  tag: string;
  customColor?: TagColor;
  onUpdateColor: (tag: string, color: Partial<TagColor>) => void;
}

export function TagManagerItem({
  tag,
  customColor,
  onUpdateColor,
}: TagManagerItemProps) {
  const [tempBg, setTempBg] = useState(customColor?.bg || "");
  const [tempFg, setTempFg] = useState(customColor?.fg || "");

  const liveColor: TagColor = {
    bg: tempBg || customColor?.bg,
    fg: tempFg || customColor?.fg,
  };
  const colors = colorForTag(
    tag,
    liveColor.bg || liveColor.fg ? { [tag]: liveColor } : {},
  );

  return (
    <Table.Tr key={tag}>
      <Table.Td px={0} w={100}>
        <Text
          size="sm"
          fw={500}
          c={colors.fg}
          bg={colors.bg}
          px={6}
          py={2}
          style={{ borderRadius: 4, display: "inline-block" }}
        >
          #{tag}
        </Text>
      </Table.Td>
      <Table.Td>
        <ColorInput
          size="xs"
          format="hex"
          placeholder="BG"
          value={tempBg}
          onChange={(c) => {
            setTempBg(c);
            onUpdateColor(tag, { bg: c });
          }}
        />
      </Table.Td>
      <Table.Td>
        <ColorInput
          size="xs"
          format="hex"
          placeholder="FG"
          value={tempFg}
          onChange={(c) => {
            setTempFg(c);
            onUpdateColor(tag, { fg: c });
          }}
        />
      </Table.Td>
    </Table.Tr>
  );
}
