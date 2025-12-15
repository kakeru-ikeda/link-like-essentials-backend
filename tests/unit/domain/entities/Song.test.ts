import type { Song } from '@/domain/entities/Song';

describe('Song Entity', () => {
  it('should create a valid song object', () => {
    const song: Song = {
      id: 1,
      songName: 'Test Song',
      songUrl: 'https://example.com/song',
      category: '103期',
      attribute: 'クール',
      centerCharacter: 'Test Character',
      singers: 'Singer1,Singer2',
      participations: 'Character1,Character2,Character3',
      liveAnalyzerImageUrl: 'https://example.com/live.png',
      jacketImageUrl: 'https://example.com/jacket.png',
      isLocked: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    expect(song).toBeDefined();
    expect(song.id).toBe(1);
    expect(song.songName).toBe('Test Song');
    expect(song.category).toBe('103期');
    expect(song.attribute).toBe('クール');
    expect(song.centerCharacter).toBe('Test Character');
  });

  it('should allow nullable fields', () => {
    const minimalSong: Song = {
      id: 1,
      songName: 'Minimal Song',
      songUrl: null,
      category: '104期',
      attribute: 'ピュア',
      centerCharacter: 'Character',
      singers: 'Singer',
      participations: null,
      liveAnalyzerImageUrl: null,
      jacketImageUrl: null,
      isLocked: null,
      createdAt: null,
      updatedAt: null,
    };

    expect(minimalSong).toBeDefined();
    expect(minimalSong.songUrl).toBeNull();
    expect(minimalSong.jacketImageUrl).toBeNull();
    expect(minimalSong.participations).toBeNull();
  });

  it('should support optional moodProgressions field', () => {
    const songWithProgressions: Song = {
      id: 1,
      songName: 'Song with Progressions',
      songUrl: null,
      category: '103期',
      attribute: 'スマイル',
      centerCharacter: 'Character',
      singers: 'Singer1,Singer2,Singer3',
      participations: 'Character1,Character2',
      liveAnalyzerImageUrl: null,
      jacketImageUrl: null,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      moodProgressions: [
        {
          id: 1,
          songId: 1,
          section: '1',
          progression: '0 → +50',
          sectionOrder: 1,
          isLocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          songId: 1,
          section: 'フィーバー',
          progression: '+50 → +75',
          sectionOrder: 2,
          isLocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    expect(songWithProgressions.moodProgressions).toBeDefined();
    expect(songWithProgressions.moodProgressions).toHaveLength(2);
    expect(songWithProgressions.moodProgressions?.[0]?.section).toBe('1');
    expect(songWithProgressions.moodProgressions?.[1]?.section).toBe(
      'フィーバー'
    );
  });

  it('should support multiple singers separated by comma', () => {
    const song: Song = {
      id: 1,
      songName: 'Group Song',
      songUrl: null,
      category: '104期',
      attribute: 'クール',
      centerCharacter: '夕霧綴理',
      singers: '乙宗梢,夕霧綴理,藤島慈,日野下花帆,村野さやか,大沢瑠璃乃',
      participations: '乙宗梢,夕霧綴理,藤島慈,日野下花帆,村野さやか,大沢瑠璃乃',
      liveAnalyzerImageUrl: null,
      jacketImageUrl: null,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(song.singers).toBe(
      '乙宗梢,夕霧綴理,藤島慈,日野下花帆,村野さやか,大沢瑠璃乃'
    );
    expect(song.singers.split(',')).toHaveLength(6);
    expect(song.participations).toBe(
      '乙宗梢,夕霧綴理,藤島慈,日野下花帆,村野さやか,大沢瑠璃乃'
    );
    expect(song.participations?.split(',')).toHaveLength(6);
  });
});
