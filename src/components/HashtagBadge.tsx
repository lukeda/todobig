import { Text } from '@mantine/core';
import { colorForTag } from '../hashtagColors';
import { useStore } from '../store';

export function HashtagBadge({
  tag,
}: {
  tag: string;
}) {
  const customTagColors = useStore((s) => s.customTagColors);
  const c = colorForTag(tag, customTagColors);
  return (
    <Text
      component="span"
      size="sm"
      fw={600}
      px={6}
      py={1}
      style={{
        backgroundColor: c.bg,
        color: c.fg,
        borderRadius: 4,
        lineHeight: 1.4,
      }}
    >
      #{tag}
    </Text>
  );
}
