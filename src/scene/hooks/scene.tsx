import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useThree } from 'react-three-fiber'
import { doSetSceneSize } from 'src'

export function useGlScene() {
  const dispatch = useDispatch()
  const { size } = useThree()
  useEffect(() => {
    dispatch(doSetSceneSize(size))
  }, [dispatch, size])
}
