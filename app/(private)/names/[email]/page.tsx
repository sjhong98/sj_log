'use client'

import deleteName from "@/actions/names/deleteName";
import updateName from "@/actions/names/updateName";
import createName from "@/actions/names/createName";
import nameTagging from "@/actions/names/nameTagging";
import getNameDetail from "@/actions/names/getNameDetail";
import getNameList from "@/actions/names/getNameList";
import getNameTagByPartialKeyword from "@/actions/names/getNameTagByPartialKeyword";
import CustomTextField from "@/components/customTextField/CustomTextField";
import Column from "@/components/flexBox/column";
import Row from "@/components/flexBox/row";
import { nameType } from "@/types/schemaType";
import { Autocomplete, Box, Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, Rating, TextField, Typography } from "@mui/material";
import { debounce } from "lodash";
import { ArrowLeftRight, Filter, Plus, Save, SearchIcon, Trash, X, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from 'react-toastify'
import getNameListByPartialKeyword from "@/actions/names/getNameListByPartialKeyword";
import getNameListGroupByTags from "@/actions/names/getNameListGroupByTags";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface TagOption {
    pk: number;
    name: string | null;
    createdAt: string;
}

export default function Page() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const filterList = ['createdAt', 'tag'];
    const [importanceLevelList, setImportanceLevelList] = useState<number[]>([0, 1, 2, 3, 4, 5]);
    const [nameList, setNameList] = useState<nameType[]>([]);
    const [nameListGroupByTags, setNameListGroupByTags] = useState<any>([]);
    const [selectedNamePk, setSelectedNamePk] = useState<number | null>(null);
    const [selectedNameDetail, setSelectedNameDetail] = useState<nameType | null>(null);
    const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
    const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tagList, setTagList] = useState<TagOption[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentFilterIndex, setCurrentFilterIndex] = useState<any>(0);
    const [formData, setFormData] = useState({
        name: '',
        subname: '',
        description: '',
        secretDescription: '',
        importanceLevel: 0,
        images: ''
    });
    const [secretMode, setSecretMode] = useState(false);
    const [showSecretModal, setShowSecretModal] = useState(false);
    const [otpValue, setOtpValue] = useState('');

    useEffect(() => {
        fetchNameList();

        // URL query parameter에서 namePk 가져오기
        const namePkParam = searchParams.get('namePk');
        if (namePkParam) {
            const pk = parseInt(namePkParam);
            if (!isNaN(pk)) {
                handleSelectNameDetail(pk);
            }
        }
    }, [searchParams])

    const fetchNameList = async () => {
        const names = await getNameList({ filter: filterList[currentFilterIndex] });
        setNameList(names || []);
    }

    useEffect(() => {
        (async () => {
            await getNameListGroupByTags()
        })()
    }, [])

    const handleSelectNameDetail = (pk: number) => {
        setSelectedNamePk(pk);
        fetchNameDetail(pk);

        // URL query parameter 업데이트
        const params = new URLSearchParams(searchParams.toString());
        params.set('namePk', pk.toString());
        router.replace(`?${params.toString()}`);
    }

    const handleUnselectNameDetail = () => {
        setSelectedNameDetail(null);
        setSelectedNamePk(null);

        // 폼 데이터 초기화
        setFormData({
            name: '',
            subname: '',
            description: '',
            secretDescription: '',
            importanceLevel: 0,
            images: ''
        });
        setTagList([]);
        setSelectedTags([]);

        // URL query parameter에서 namePk 제거
        const params = new URLSearchParams(searchParams.toString());
        params.delete('namePk');
        router.replace(`?${params.toString()}`);
    }

    const fetchNameDetail = async (pk: number) => {
        const name = await getNameDetail(pk);
        setSelectedNameDetail(name || null);

        // 폼 데이터 설정
        if (name) {
            setFormData({
                name: name.name || '',
                subname: name.subname || '',
                description: name.description || '',
                secretDescription: name.secretDescription || '',
                importanceLevel: name.importanceLevel || 0,
                images: name.images || ''
            });
            setSelectedTags(name.tags || []);
        }
    }

    // debounced search function
    const debouncedSearch = useCallback(
        debounce(async (keyword: string) => {
            if (keyword.length < 2) {
                setTagOptions([]);
                return;
            }

            setLoading(true);
            try {
                const tags = await getNameTagByPartialKeyword(keyword);
                setTagOptions(tags || []);
            } catch (error) {
                console.error('태그 검색 오류:', error);
                setTagOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSearch(tagInput);
        return () => {
            debouncedSearch.cancel();
        };
    }, [tagInput, debouncedSearch]);

    const handleTagChange = (event: any, newValue: (string | TagOption)[]) => {
        const processedTags: TagOption[] = [];

        newValue.forEach((value) => {
            if (typeof value === 'string') {
                let tagName = value;

                // '새로운 태그 추가' 문자열에서 실제 태그 이름 추출
                if (value.includes('새로운 태그 추가:')) {
                    tagName = value.replace('새로운 태그 추가: "', '').replace('"', '');
                }

                // 새로운 태그 생성
                const newTag: TagOption = {
                    pk: Date.now(), // 임시 pk
                    name: tagName,
                    createdAt: new Date().toISOString()
                };

                // 중복 체크
                if (!selectedTags.find(tag => tag.name === newTag.name)) {
                    processedTags.push(newTag);
                }
            } else if (typeof value === 'object' && value !== null) {
                // 기존 태그인 경우 중복 체크
                if (!selectedTags.find(tag => tag.pk === value.pk)) {
                    processedTags.push(value);
                }
            }
        });

        const updatedTags = [...selectedTags, ...processedTags];
        setSelectedTags(updatedTags);
        setTagList(updatedTags);
        setTagInput('');
    };

    const handleTagDelete = (tagToDelete: TagOption) => {
        const updatedTags = selectedTags.filter(tag => tag.pk !== tagToDelete.pk);
        setSelectedTags(updatedTags);
        setTagList(updatedTags);
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedNamePk) return;

        try {
            const result = await deleteName(selectedNamePk);
            if (result) {
                // 성공적으로 삭제된 경우
                setSelectedNameDetail(null);
                setSelectedNamePk(null);

                // URL query parameter에서 namePk 제거
                const params = new URLSearchParams(searchParams.toString());
                params.delete('namePk');
                router.replace(`?${params.toString()}`);

                fetchNameList(); // 목록 새로고침
                toast.success('이름이 성공적으로 삭제되었습니다.');
            } else {
                toast.error('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('이름 삭제 오류:', error);
            toast.error('삭제 중 오류가 발생했습니다.');
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    const processTags = async (namePk: number) => {
        try {
            for (const tag of tagList) {
                console.log('추가 중인 태그: ', tag.name)
                if (tag.name) {
                    const result = await nameTagging({
                        namePk,
                        tagName: tag.name
                    });
                    if (result) toast.success(`${tag.name} 태그에 성공적으로 추가되었습니다.`, { toastId: tag.name });
                    else if (!result) toast.error(`${tag.name} 태그에 실패했습니다.`, { toastId: tag.name });
                }
            }
        } catch (error) {
            console.error('태그 처리 오류:', error);
        }
    };

    const handleSaveName = async () => {
        try {
            const namePkParam = searchParams.get('namePk');

            if (namePkParam) {
                // Update existing name
                const pk = parseInt(namePkParam);
                if (!isNaN(pk)) {
                    const result = await updateName({
                        pk,
                        name: formData.name,
                        subname: formData.subname,
                        description: formData.description,
                        secretDescription: formData.secretDescription,
                        importanceLevel: formData.importanceLevel,
                        images: formData.images
                    });

                    if (result) {
                        // 태그 처리
                        await processTags(pk);

                        toast.success('이름이 성공적으로 수정되었습니다.');
                        fetchNameList(); // 목록 새로고침
                        fetchNameDetail(pk); // 상세 정보 새로고침
                    } else {
                        toast.error('수정에 실패했습니다.');
                    }
                }
            } else {
                // Create new name
                const result = await createName({
                    name: formData.name,
                    subname: formData.subname,
                    description: formData.description,
                    secretDescription: formData.secretDescription,
                    importanceLevel: formData.importanceLevel,
                    images: formData.images
                } as any);

                if (result) {
                    // 태그 처리
                    await processTags(result.pk);

                    toast.success('이름이 성공적으로 생성되었습니다.');
                    fetchNameList(); // 목록 새로고침
                    // 폼 초기화
                    setFormData({
                        name: '',
                        subname: '',
                        description: '',
                        secretDescription: '',
                        importanceLevel: 0,
                        images: ''
                    });
                    setTagList([]);
                    setSelectedTags([]);
                } else {
                    toast.error('생성에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('저장 오류:', error);
            toast.error('저장 중 오류가 발생했습니다.');
        }
    };

    const handleCreateNewName = () => {
        setSelectedNameDetail({} as any); // 빈 객체로 설정하여 폼 표시
        setSelectedNamePk(null);
        setFormData({
            name: '',
            subname: '',
            description: '',
            secretDescription: '',
            importanceLevel: 0,
            images: ''
        });
        setTagList([]);
        setSelectedTags([]);
        // URL에서 namePk 제거
        const params = new URLSearchParams(searchParams.toString());
        params.delete('namePk');
        router.replace(`?${params.toString()}`);
    }

    const handleSearchKeywordChange = async (e: any) => {
        setSearchKeyword(e.target.value);
        const names = await getNameListByPartialKeyword(e.target.value);
        setNameList(names || []);
    }

    const handleChangeFilter = async (e: any) => {
        let _currentFilterIndex = currentFilterIndex === filterList.length - 1 ? 0 : currentFilterIndex + 1
        setCurrentFilterIndex(_currentFilterIndex);
        if (_currentFilterIndex === 0) fetchNameList()
        else if (_currentFilterIndex === 1) {
            const names = await getNameListGroupByTags()
            setNameListGroupByTags(names || []);
        }
    }

    const handleSecretMode = () => {
        if (secretMode) {
            // 이미 secret mode가 켜져있으면 끄기
            setSecretMode(false);
        } else {
            // secret mode를 켜려면 OTP 모달 표시
            setShowSecretModal(true);
        }
    };

    const handleOtpSubmit = (e: any) => {
        e.preventDefault();

        // 간단한 OTP 검증 (실제로는 서버에서 검증해야 함)
        if (otpValue === '404919') {
            setSecretMode(true);
            setShowSecretModal(false);
            setOtpValue('');
        } else {
            toast.error('잘못된 OTP 코드입니다.');
        }
    };

    const handleSecretModalClose = () => {
        setShowSecretModal(false);
        setOtpValue('');
    };

    return (
        <Row gap={4} className="w-full">
            {/* Name List Area */}
            <Column gap={2} className="flex-[1] w-full">
                <Row gap={1}>
                    <Row
                        fullWidth
                        gap={1}
                        className='rounded-md p-2 border-[#333] hover:border-[#ddd] border-[1px] h-12 flex items-center pl-4 pr-5 group cursor-pointer'
                    >
                        <SearchIcon className='text-[#333] group-hover:text-[#ddd] duration-100' />
                        <input
                            placeholder='Search ⌘K'
                            className='!text-[#ddd] text-[16px] group-hover:text-[#ddd] duration-100 outline-none placeholder:text-[#333] group-hover:placeholder:text-[#ddd]'
                            value={searchKeyword}
                            onChange={handleSearchKeywordChange}
                        />
                    </Row>
                    <Row
                        gap={1}
                        className='rounded-md p-2 border-[#333] hover:border-[#ddd] border-[1px] h-12 flex items-center px-3 group cursor-pointer'
                        onClick={handleChangeFilter}
                    >
                        <Filter />
                    </Row>
                </Row>
                <Row gap={1} className="flex-wrap overflow-y-auto max-h-[calc(100vh-200px)]">
                    {currentFilterIndex === 0 ? (
                        <>
                            <Row
                                className='bg-stone-900 rounded-md px-2 py-1 w-[20%] min-w-[150px] cursor-pointer hover:bg-stone-800 duration-75 justify-center items-center'
                                onClick={handleCreateNewName}
                            >
                                <Plus />
                                <Typography variant="body1">ADD</Typography>
                            </Row>
                            {nameList.map((name) => (
                                <Column
                                    key={name.pk}
                                    className='bg-stone-900 rounded-md px-2 py-1 w-[20%] min-w-[150px] cursor-pointer hover:bg-stone-800 duration-75 justify-start min-h-[54px]'
                                    onClick={() => {
                                        if (name?.pk) handleSelectNameDetail(name.pk)
                                    }}
                                >
                                    <Typography variant="body1">{(name?.name && name.name !== '') ? name.name : '-'}</Typography>
                                    <Typography variant="subtitle1" className="!text-[12px] text-stone-500 line-clamp-1">{(name?.subname || name.subname !== '') ? name.subname : ''}</Typography>
                                </Column>
                            ))
                            }
                        </>
                    ) : (
                        <>
                            <Column gap={4} className="w-full">
                                {nameListGroupByTags.map((nameListGroup: any, index: number) => (
                                    <Column
                                        key={index}
                                        className='w-full'
                                    >
                                        <Typography variant="body1">#{nameListGroup.tag.name ?? '-'}</Typography>

                                        <Row gap={1} className="flex-wrap overflow-y-auto max-h-[calc(100vh-200px)]">
                                            {nameListGroup.name.map((name: any) => (
                                                <Column
                                                    key={name.pk}
                                                    className='bg-stone-900 rounded-md px-2 py-1 w-[20%] min-w-[150px] cursor-pointer hover:bg-stone-800 duration-75 justify-start min-h-[54px]'
                                                    onClick={() => {
                                                        if (name?.pk) handleSelectNameDetail(name.pk)
                                                    }}
                                                >
                                                    <Typography variant="body1">{name?.name ?? '-'}</Typography>
                                                    <Typography variant="subtitle1" className="!text-[12px] text-stone-500 line-clamp-1">{name?.subname ?? '-'}</Typography>
                                                </Column>
                                            ))}
                                        </Row>
                                    </Column>
                                ))
                                }
                            </Column>
                        </>
                    )}
                </Row>
            </Column>

            {/* Name Detail Area */}
            {selectedNameDetail && (
                <Column gap={1} className="flex-[1.2] w-full p-2 rounded-xl bg-stone-900 h-fit">
                    <Row gap={1} className='items-center'>
                        <CustomTextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Row className="bg-[#010101] rounded-md p-2 h-[55px] items-center">
                            <IconButton onClick={handleSaveName} className="w-8 h-8">
                                <Save className="size-4" />
                            </IconButton>
                            <IconButton onClick={handleDeleteClick} className="w-8 h-8">
                                <Trash className="size-4" />
                            </IconButton>
                            <IconButton onClick={handleUnselectNameDetail} className="w-8 h-8">
                                <X className="size-4" />
                            </IconButton>
                        </Row>
                    </Row>
                    <CustomTextField
                        fullWidth
                        label="Subname"
                        value={formData.subname}
                        onChange={(e) => setFormData({ ...formData, subname: e.target.value })}
                    />
                    <Column className="relative w-full">
                        <CustomTextField
                            fullWidth
                            multiline
                            label={secretMode ? "Secret Description" : "Description"}
                            minRows={10}
                            value={secretMode ? formData.secretDescription : formData.description}
                            onChange={(e) => {
                                if (secretMode) {
                                    setFormData({ ...formData, secretDescription: e.target.value });
                                } else {
                                    setFormData({ ...formData, description: e.target.value });
                                }
                            }}
                        />
                        <IconButton className="!absolute !top-1 !right-1 w-5 h-5" onClick={handleSecretMode}>
                            {secretMode ? <EyeOff className="scale-[2]" /> : <Eye className="scale-[2]" />}
                        </IconButton>
                    </Column>
                    <Row gap={1} fullWidth>
                        <Row className="flex-[3] bg-[#010101] rounded-md items-center px-3">
                            <Autocomplete
                                freeSolo
                                multiple
                                fullWidth
                                className='ml-[-2px]'
                                options={tagInput.trim() && !tagOptions.find(option => option.name === tagInput.trim())
                                    ? [...tagOptions, `새로운 태그 추가: "${tagInput.trim()}"`]
                                    : tagOptions}
                                getOptionLabel={(option) => typeof option === 'string' ? option : option.name || ''}
                                value={selectedTags}
                                inputValue={tagInput}
                                onInputChange={(event, newInputValue) => {
                                    setTagInput(newInputValue);
                                }}
                                onChange={handleTagChange}
                                loading={loading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        placeholder=""
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                paddingLeft: '0px',
                                                '& fieldset': {
                                                    border: 'none',
                                                },
                                                '&:hover fieldset': {
                                                    border: 'none',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    border: 'none',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#ccc',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#ccc',
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                color: '#fff',
                                            },
                                        }}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={index}
                                            label={`#${typeof option === 'object' ? option.name || '' : option}`}
                                            onDelete={() => typeof option === 'object' && handleTagDelete(option)}
                                            sx={{
                                                backgroundColor: '#333',
                                                color: '#fff',
                                                '& .MuiChip-deleteIcon': {
                                                    color: '#ccc',
                                                    '&:hover': {
                                                        color: '#fff',
                                                    },
                                                },
                                            }}
                                        />
                                    ))
                                }
                                renderOption={(props, option) => (
                                    <Box component="li" {...props} key={typeof option === 'string' ? option : option.pk}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: typeof option === 'string' && option.includes('새로운 태그 추가')
                                                    ? '#4ade80'
                                                    : '#fff'
                                            }}
                                        >
                                            {typeof option === 'string'
                                                ? option
                                                : `#${option.name || ''}`
                                            }
                                        </Typography>
                                    </Box>
                                )}
                                sx={{
                                    '& .MuiAutocomplete-popper': {
                                        '& .MuiPaper-root': {
                                            backgroundColor: '#333',
                                            color: '#fff',
                                        },
                                    },
                                }}
                            />
                        </Row>
                        <Column className="flex-[1] flex items-center justify-center bg-[#010101] rounded-md px-2">
                            <Typography variant="body2" className="text-gray-400">
                                Importance Level
                            </Typography>
                            <Rating
                                name="importance-level"
                                value={formData.importanceLevel}
                                max={5}
                                size="large"
                                onChange={(event, newValue) => {
                                    setFormData({ ...formData, importanceLevel: newValue || 0 });
                                }}
                                sx={{
                                    '& .MuiRating-iconEmpty': {
                                        color: '#666',
                                    },
                                    '& .MuiRating-iconFilled': {
                                        color: '#fbbf24',
                                    },
                                    '& .MuiRating-iconHover': {
                                        color: '#f59e0b',
                                    },
                                }}
                            />
                        </Column>
                    </Row>
                </Column>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-stone-900 rounded-lg p-6 max-w-md w-full mx-4">
                        <Typography variant="h6" className="text-white mb-4">
                            이름 삭제 확인
                        </Typography>
                        <Typography variant="body1" className="text-gray-300 mb-6">
                            정말로 이 이름을 삭제하시겠습니까?<br />
                            삭제된 데이터는 복구할 수 없습니다.
                        </Typography>
                        <Row gap={2} className="justify-end">
                            <Button
                                variant="outlined"
                                className="!border-gray-500 !text-gray-300 hover:!bg-gray-800"
                                onClick={handleDeleteCancel}
                            >
                                취소
                            </Button>
                            <Button
                                variant="contained"
                                className="!bg-red-600 !text-white hover:!bg-red-700"
                                onClick={handleDeleteConfirm}
                            >
                                삭제
                            </Button>
                        </Row>
                    </div>
                </div>
            )}

            {/* Secret Mode OTP Modal */}
            <Dialog
                open={showSecretModal}
                onClose={handleSecretModalClose}
            >
                <DialogContent className="!p-0 overflo-hidden">
                    <form onSubmit={handleOtpSubmit}>
                        <InputOTP
                            maxLength={6}
                            value={otpValue}
                            onChange={(value) => setOtpValue(value)}
                            className="overflow-hidden !w-fit"
                        >
                            <InputOTPGroup className="overflow-hidden">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </form>
                </DialogContent>
            </Dialog>
        </Row>
    )
}